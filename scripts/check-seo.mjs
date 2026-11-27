import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const notFoundFiles = new Set(["404.html", "404/index.html", "_not-found/index.html"]);

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (name.endsWith(".html")) files.push(full);
  }
  return files;
}

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, digits) => String.fromCharCode(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) => String.fromCharCode(parseInt(digits, 16)));
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  if (!match) return null;
  return decode(match[2] ?? match[3] ?? "");
}

function tags(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[0]);
}

function relPath(file) {
  return path.relative(outDir, file).split(path.sep).join("/");
}

function routeFor(rel) {
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  if (rel === "404.html") return "/404.html";
  return null;
}

function logicalPage(rel) {
  return notFoundFiles.has(rel) ? "404" : rel;
}

function walkJsonLd(value, file, errors) {
  if (Array.isArray(value)) {
    for (const item of value) walkJsonLd(item, file, errors);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if ((key === "url" || key === "@id") && (typeof child !== "string" || !/^https?:\/\//i.test(child))) {
      errors.push(`${file}: JSON-LD ${key} is not an absolute URL`);
    } else {
      walkJsonLd(child, file, errors);
    }
  }
}

const errors = [];
const htmlFiles = walk(outDir).sort();
if (htmlFiles.length === 0) errors.push("out/ has no HTML files. Run npm run build first.");

const titles = new Map();
const descriptions = new Map();
const indexable = [];

for (const file of htmlFiles) {
  const rel = relPath(file);
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/);
  const descriptionTag = tags(html, /<meta\b[^>]*>/gi).find((tag) => attr(tag, "name") === "description");
  const canonicalTag = tags(html, /<link\b[^>]*>/gi).find((tag) => attr(tag, "rel") === "canonical");
  const metas = tags(html, /<meta\b[^>]*>/gi);
  const og = (property) => metas.filter((tag) => attr(tag, "property") === property).map((tag) => attr(tag, "content"));
  const titleText = title ? decode(title[1]).trim() : "";
  const description = descriptionTag ? (attr(descriptionTag, "content") ?? "").trim() : "";
  const canonical = canonicalTag ? (attr(canonicalTag, "href") ?? "").trim() : "";
  const ogTitle = (og("og:title")[0] ?? "").trim();
  const ogDescription = (og("og:description")[0] ?? "").trim();
  const ogUrl = (og("og:url")[0] ?? "").trim();
  const ogType = (og("og:type")[0] ?? "").trim();
  const ogImages = og("og:image").map((value) => (value ?? "").trim()).filter(Boolean);
  const twitter = metas.find((tag) => attr(tag, "name") === "twitter:card");
  const twitterCard = twitter ? (attr(twitter, "content") ?? "").trim() : "";

  if (!titleText) errors.push(`${rel}: missing <title>`);
  if (!description) errors.push(`${rel}: missing meta description`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!ogTitle) errors.push(`${rel}: missing og:title`);
  if (!ogDescription) errors.push(`${rel}: missing og:description`);
  if (!ogUrl) errors.push(`${rel}: missing og:url`);
  if (!ogType) errors.push(`${rel}: missing og:type`);
  if (ogImages.length === 0) errors.push(`${rel}: missing og:image`);
  if (twitterCard !== "summary_large_image") errors.push(`${rel}: twitter:card must be summary_large_image`);

  const page = logicalPage(rel);
  if (titleText) {
    const seen = titles.get(titleText) ?? new Set();
    seen.add(page);
    titles.set(titleText, seen);
  }
  if (description) {
    const seen = descriptions.get(description) ?? new Set();
    seen.add(page);
    descriptions.set(description, seen);
  }

  if (!canonical) continue;
  let canonicalUrl;
  try {
    canonicalUrl = new URL(canonical);
  } catch {
    errors.push(`${rel}: canonical is not absolute (${canonical})`);
    continue;
  }
  if (ogUrl && ogUrl !== canonical) errors.push(`${rel}: og:url does not match canonical`);
  if (!ogImages.some((image) => image.endsWith("/images/og.png"))) {
    errors.push(`${rel}: og:image is not /images/og.png`);
  }

  const route = routeFor(rel);
  if (!route) {
    errors.push(`${rel}: unexpected HTML path`);
    continue;
  }
  if (notFoundFiles.has(rel)) {
    if (canonicalUrl.pathname !== "/404.html") errors.push(`${rel}: canonical must be /404.html`);
    continue;
  }
  if (canonicalUrl.pathname !== route) {
    errors.push(`${rel}: canonical path ${canonicalUrl.pathname} is not ${route}`);
  }
  if (route !== "/" && !canonicalUrl.pathname.endsWith("/")) {
    errors.push(`${rel}: canonical is missing a trailing slash`);
  }
  indexable.push(canonicalUrl.href);
}

for (const [title, pages] of titles) {
  if (pages.size > 1) errors.push(`duplicate title "${title}" on ${[...pages].join(", ")}`);
}
for (const [description, pages] of descriptions) {
  if (pages.size > 1) errors.push(`duplicate description "${description}" on ${[...pages].join(", ")}`);
}

const sitemapPath = path.join(outDir, "sitemap.xml");
const robotsPath = path.join(outDir, "robots.txt");
let sitemapLocs = [];
try {
  const sitemap = readFileSync(sitemapPath, "utf8");
  sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => decode(match[1]).trim());
} catch {
  errors.push("missing out/sitemap.xml");
}
try {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/Allow:\s*\//.test(robots)) errors.push("robots.txt does not allow all");
  const origin = indexable[0] ? new URL(indexable[0]).origin : "";
  const expected = origin ? `Sitemap: ${origin}/sitemap.xml` : "";
  if (!expected || !robots.includes(expected)) errors.push(`robots.txt Sitemap line must be ${expected || "the site origin"}`);
} catch {
  errors.push("missing out/robots.txt");
}

const indexableSet = new Set(indexable);
const sitemapSet = new Set(sitemapLocs);
for (const loc of sitemapSet) {
  if (!indexableSet.has(loc)) errors.push(`sitemap includes ${loc} which is not an exported HTML route`);
}
for (const loc of indexableSet) {
  if (!sitemapSet.has(loc)) errors.push(`sitemap is missing ${loc}`);
}
if (sitemapLocs.some((loc) => /\/404(?:\.html)?\/?$/.test(loc) || loc.includes("_not-found"))) {
  errors.push("sitemap includes a 404 route");
}

for (const file of htmlFiles) {
  const rel = relPath(file);
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walkJsonLd(JSON.parse(match[1]), rel, errors);
    } catch {
      errors.push(`${rel}: JSON-LD is not valid JSON`);
    }
  }
}

if (errors.length > 0) {
  console.error(`SEO check failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `SEO check passed: ${htmlFiles.length} HTML files, ${indexableSet.size} indexable routes, sitemap ${sitemapSet.size}.`,
);
