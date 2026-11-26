import { productSummary } from "@/lib/format";
import { getSiteUrl } from "@/lib/site";
import type { GymProduct } from "@/lib/types";

export function productJsonLd(product: GymProduct): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.model}`,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    description: productSummary(product),
    url: `${getSiteUrl()}/products/${product.slug}/`,
  };
  if (product.sku) data.sku = product.sku;
  return data;
}

export function pageListJsonLd(
  name: string,
  pages: { title: string; path: string }[],
): Record<string, unknown> {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: pages.map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: page.title,
      url: `${site}${page.path}`,
    })),
  };
}

export function itemListJsonLd(name: string, products: GymProduct[]): Record<string, unknown> {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${product.brand} ${product.model}`,
      url: `${site}/products/${product.slug}/`,
    })),
  };
}
