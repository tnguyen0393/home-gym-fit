import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
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
 * is non-empty. Bodies are Markdown. JSX in .mdx files is not executed.
 *
 * Sprint 1 routes this pipeline is ready to serve, with no sample articles:
 * - content/guides/folding-power-racks-8-foot-ceiling.mdx
 * - content/guides/best-short-olympic-barbells.mdx
 * - content/compare/rep-pr-4100-vs-rogue-rml-3w.mdx
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

export async function renderMarkdown(source: string): Promise<string> {
  const file = await remark()
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(source);
  return String(file);
}
