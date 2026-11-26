import Link from "next/link";
import { amazonLink } from "@/lib/affiliates";
import { articleNeedsDisclosure, type ArticleHeading } from "@/lib/content";
import {
  articleStatusLine,
  articleTypeLabel,
  humanizeTag,
} from "@/lib/format";
import { itemListJsonLd } from "@/lib/jsonld";
import type { ArticleDocument, GymProduct } from "@/lib/types";
import { DisclosureNote } from "@/components/DisclosureNote";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { textLinkClass } from "@/components/styles";

function directoryCta(article: ArticleDocument): { href: string; label: string } {
  const params = new URLSearchParams();
  const tags = article.constraintTags ?? [];
  if (tags.includes("8-foot-ceiling")) params.set("ceiling", "96");
  if (tags.includes("84-inch-ceiling") || tags.includes("under-84-inch-ceiling")) {
    params.set("ceiling", "84");
  }
  if (tags.some((tag) => tag.includes("renter"))) params.set("renter", "1");
  if (tags.some((tag) => tag.includes("folding"))) params.set("folding", "1");
  if (tags.includes("folding-wall-rack")) params.set("rack", "folding-wall");
  const query = params.toString();
  return {
    href: query.length > 0 ? `/directory/?${query}` : "/directory/",
    label: tags.includes("8-foot-ceiling")
      ? "Filter 8-foot ceiling racks →"
      : "Filter matching gear in the directory →",
  };
}

function compareCta(article: ArticleDocument): { href: string; label: string } {
  if (article.productIds.length >= 2) {
    const count = Math.min(article.productIds.length, 3);
    const params = new URLSearchParams();
    params.set("compare", article.productIds.slice(0, 3).join(","));
    return {
      href: `/directory/?${params.toString()}`,
      label: `Compare these ${count} in the directory →`,
    };
  }
  return {
    href: "/compare/",
    label: article.type === "compare" ? "More comparisons →" : "Read comparisons →",
  };
}

export function ArticleView({
  article,
  html,
  headings,
  products,
}: {
  article: ArticleDocument;
  html: string;
  headings: ArticleHeading[];
  products: GymProduct[];
}) {
  const showAmazon = products.some((product) => amazonLink(product) != null);
  const directory = directoryCta(article);
  const compare = compareCta(article);

  return (
    <article className="flex flex-col gap-6">
      {products.length > 0 ? <JsonLd data={itemListJsonLd(article.title, products)} /> : null}
      {articleNeedsDisclosure(article) ? (
        <DisclosureNote includeAmazonStatement={showAmazon} />
      ) : null}
      <header className="flex max-w-prose flex-col gap-2">
        <p className="text-sm font-medium text-indigo-800">{articleTypeLabel(article.type)}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{article.title}</h1>
        <p className="text-lg text-stone-700">{article.description}</p>
        <p className="text-sm text-stone-600">{articleStatusLine(article)}</p>
      </header>
      {headings.length > 0 ? (
        <nav aria-label="On this page" className="max-w-4xl text-sm">
          <ol className="flex flex-wrap gap-x-2 gap-y-1">
            {headings.map((heading, index) => (
              <li key={heading.id} className="inline-flex items-baseline gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-stone-300">
                    ·
                  </span>
                ) : null}
                <a href={`#${heading.id}`} className={textLinkClass}>
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {html.trim().length > 0 ? (
        <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="max-w-prose text-sm text-stone-600">This article has no body yet.</p>
      )}
      <nav aria-label="Related" className="flex max-w-prose flex-col gap-2 text-sm">
        <Link href={directory.href} className={textLinkClass}>
          {directory.label}
        </Link>
        <Link href={compare.href} className={textLinkClass}>
          {compare.label}
        </Link>
      </nav>
      {article.constraintTags && article.constraintTags.length > 0 ? (
        <ul aria-label="Topics" className="flex flex-wrap gap-2">
          {article.constraintTags.map((tag) => (
            <li key={tag} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
              {humanizeTag(tag)}
            </li>
          ))}
        </ul>
      ) : null}
      {products.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Linked equipment</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} headingLevel={3} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
