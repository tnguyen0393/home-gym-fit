import type { MetadataRoute } from "next";
import { listComparisons, listGuides } from "@/lib/content";
import { fitPresets } from "@/lib/fit";
import { getProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const paths = [
    "/",
    "/directory/",
    "/guides/",
    "/compare/",
    "/about/",
    "/methodology/",
    "/disclosure/",
    "/privacy/",
    ...fitPresets.map((preset) => `/fit/${preset.slug}/`),
    ...getProducts().map((product) => `/products/${product.slug}/`),
    ...listGuides().map((article) => `/guides/${article.slug}/`),
    ...listComparisons().map((article) => `/compare/${article.slug}/`),
  ];
  return paths.map((path) => ({ url: `${site}${path}` }));
}
