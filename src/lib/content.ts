import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { getProductById } from "@/lib/products";
import type { ArticleDocument, ArticleType, GymProduct } from "@/lib/types";

/**
 * Frontmatter contract for Guide & Comparison Editor.
 *
 * Files:
 * - content/guides/*.md or *.mdx → /guides/<slug>/
 *   type: "guide" | "explainer" (explainers stay on the guides route)
 * - content/compare/*.md or *.mdx → /compare/<slug>/
 *   type: "compare"
 *
 * Required keys: title, description, slug, type, publishedAt, updatedAt, productIds.
 * slug matches the filename without its extension.
 * productIds are GymProduct.id values from data/products.json (use [] when none).
 * Dates are YYYY-MM-DD.
 *
 * Optional keys: constraintTags (string[]), lastVerifiedDate (YYYY-MM-DD),
 * testingStatus (string), ftcDisclosure (boolean).
 *
 * The article page shows the FTC note when ftcDisclosure is true or productIds
 * is non-empty. Bodies are Markdown, including GFM tables. JSX in .mdx files is not executed.
 */

const GUIDE_DIR = path.join(process.cwd(), "content", "guides");
const COMPARE_DIR = path.join(process.cwd(), "content", "compare");
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KNOWN_KEYS = new Set([
  "title",
  "description",
  "slug",
  "type",
  "publishedAt",
  "updatedAt",
  "productIds",
  "constraintTags",
  "lastVerifiedDate",
  "testingStatus",
  "ftcDisclosure",
]);

let guides: ArticleDocument[] | null = null;
let comparisons: ArticleDocument[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function requireString(data: Record<string, unknown>, key: string, filePath: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${filePath}: ${key} must be a non-empty string`);
  }
  return value.trim();
}

function requireDate(data: Record<string, unknown>, key: string, filePath: string): string {
  const value = data[key];
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const iso = value.toISOString().slice(0, 10);
    if (isIsoDate(iso)) return iso;
  }
  if (typeof value === "string" && isIsoDate(value.trim())) return value.trim();
  throw new Error(`${filePath}: ${key} must be YYYY-MM-DD`);
}

function parseFrontmatter(
  filePath: string,
  filename: string,
  data: unknown,
  place: "guide" | "compare",
): Omit<ArticleDocument, "body"> {
  if (!isRecord(data)) throw new Error(`${filePath}: frontmatter must be a mapping`);
  for (const key of Object.keys(data)) {
    if (!KNOWN_KEYS.has(key)) throw new Error(`${filePath}: unknown frontmatter key "${key}"`);
  }

  const type = data.type;
  const allowed: ArticleType[] = place === "guide" ? ["guide", "explainer"] : ["compare"];
  if (typeof type !== "string" || !allowed.includes(type as ArticleType)) {
    throw new Error(`${filePath}: type must be ${allowed.join(" or ")}`);
  }

  const slug = requireString(data, "slug", filePath);
  const stem = filename.replace(/\.mdx?$/, "");
  if (slug !== stem) {
    throw new Error(`${filePath}: slug "${slug}" must match the filename "${stem}"`);
  }

  const publishedAt = requireDate(data, "publishedAt", filePath);
  const updatedAt = requireDate(data, "updatedAt", filePath);

  if (!Array.isArray(data.productIds) || data.productIds.some((id) => typeof id !== "string")) {
    throw new Error(`${filePath}: productIds must be an array of strings`);
  }

  const article: Omit<ArticleDocument, "body"> = {
    title: requireString(data, "title", filePath),
    description: requireString(data, "description", filePath),
    slug,
    type: type as ArticleType,
    publishedAt,
    updatedAt,
    productIds: data.productIds,
  };

  if ("constraintTags" in data) {
    if (
      !Array.isArray(data.constraintTags) ||
      data.constraintTags.some((tag) => typeof tag !== "string" || tag.trim().length === 0)
    ) {
      throw new Error(`${filePath}: constraintTags must be an array of non-empty strings`);
    }
    article.constraintTags = data.constraintTags;
  }
  if ("lastVerifiedDate" in data) {
    article.lastVerifiedDate = requireDate(data, "lastVerifiedDate", filePath);
  }
  if ("testingStatus" in data) {
    if (typeof data.testingStatus !== "string" || data.testingStatus.trim().length === 0) {
      throw new Error(`${filePath}: testingStatus must be a non-empty string`);
    }
    article.testingStatus = data.testingStatus.trim();
  }
  if ("ftcDisclosure" in data) {
    if (typeof data.ftcDisclosure !== "boolean") {
      throw new Error(`${filePath}: ftcDisclosure must be a boolean`);
    }
    article.ftcDisclosure = data.ftcDisclosure;
  }

  return article;
}

function loadDir(dir: string, place: "guide" | "compare"): ArticleDocument[] {
  if (!fs.existsSync(dir)) return [];
  const filenames = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") || name.endsWith(".mdx"))
    .sort();
  const articles = filenames.map((filename) => {
    const filePath = path.join(dir, filename);
    const parsed = matter(fs.readFileSync(filePath, "utf8"));
    const frontmatter = parseFrontmatter(filePath, filename, parsed.data, place);
    return { ...frontmatter, body: parsed.content };
  });
  const slugs = new Set<string>();
  for (const article of articles) {
    if (slugs.has(article.slug)) {
      throw new Error(`${dir}: duplicate slug "${article.slug}"`);
    }
    slugs.add(article.slug);
  }
  return articles;
}

export function listGuides(): ArticleDocument[] {
  if (!guides) guides = loadDir(GUIDE_DIR, "guide");
  return guides;
}

export function listComparisons(): ArticleDocument[] {
  if (!comparisons) comparisons = loadDir(COMPARE_DIR, "compare");
  return comparisons;
}

export function getGuide(slug: string): ArticleDocument | undefined {
  return listGuides().find((article) => article.slug === slug);
}

export function getComparison(slug: string): ArticleDocument | undefined {
  return listComparisons().find((article) => article.slug === slug);
}

export function articleNeedsDisclosure(article: ArticleDocument): boolean {
  return article.ftcDisclosure === true || article.productIds.length > 0;
}

export function productsForArticle(article: ArticleDocument): GymProduct[] {
  return article.productIds.map((id) => {
    const product = getProductById(id);
    if (!product) {
      throw new Error(`Article "${article.slug}" references unknown product id "${id}"`);
    }
    return product;
  });
}

export interface ArticleHeading {
  id: string;
  text: string;
}

interface MdNode {
  type: string;
  tagName?: string;
  value?: string;
  children?: MdNode[];
  properties?: Record<string, unknown>;
}

const MISSING_STATUS = /^(not published|not included|unverified)\b/i;
const PROSE_TAGS = new Set(["h3", "p", "ul", "ol", "blockquote"]);

function textOf(node: MdNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function addClass(node: MdNode, className: string) {
  const properties = node.properties ?? {};
  const current = properties.className;
  const list = Array.isArray(current)
    ? current.map(String)
    : typeof current === "string"
      ? current.split(/\s+/).filter(Boolean)
      : [];
  if (!list.includes(className)) list.push(className);
  node.properties = { ...properties, className: list };
}

function uniqueId(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/&amp;/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
}

function markOutbound(node: MdNode) {
  const href = node.properties?.href;
  if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return;
  node.properties = {
    ...node.properties,
    target: "_blank",
    rel: "sponsored nofollow noopener noreferrer",
  };
}

function enhanceTree(node: MdNode, headings: ArticleHeading[], used: Set<string>) {
  if (node.type === "element") {
    if (node.tagName === "h2") {
      const text = textOf(node).replace(/\s+/g, " ").trim();
      const id = uniqueId(text, used);
      node.properties = { ...(node.properties ?? {}), id };
      addClass(node, "max-w-prose");
      headings.push({ id, text });
    } else if (node.tagName && PROSE_TAGS.has(node.tagName)) {
      addClass(node, "max-w-prose");
    } else if (node.tagName === "td" || node.tagName === "th") {
      if (MISSING_STATUS.test(textOf(node).trim())) addClass(node, "status-missing");
    } else if (node.tagName === "a") {
      markOutbound(node);
    } else if (node.tagName === "table") {
      addClass(node, "tabular-nums");
    }
  }

  const children = node.children ?? [];
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    enhanceTree(child, headings, used);
    if (child.type === "element" && child.tagName === "table") {
      children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll", "max-w-4xl", "overflow-x-auto"] },
        children: [child],
      };
    }
  }
}

/** The template owns the single FTC bar, so a leading disclosure quote is not rendered twice. */
function stripLeadingDisclosure(source: string): string {
  const match = source.match(/^(?:\s*\n)*(?:>[^\n]*\n?)+/);
  if (!match) return source;
  const quote = match[0].replace(/^>\s?/gm, " ").replace(/\s+/g, " ").trim();
  if (!/^disclosure:/i.test(quote)) return source;
  return source.slice(match[0].length).replace(/^\n+/, "");
}

export async function renderMarkdown(
  source: string,
): Promise<{ html: string; headings: ArticleHeading[] }> {
  const headings: ArticleHeading[] = [];
  const used = new Set<string>();
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(() => (tree: MdNode) => {
      enhanceTree(tree, headings, used);
    })
    .use(rehypeStringify)
    .process(stripLeadingDisclosure(source));
  return { html: String(file), headings };
}
