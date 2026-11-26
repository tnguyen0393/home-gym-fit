import { amazonLink } from "@/lib/affiliates";
import { articleNeedsDisclosure } from "@/lib/content";
import type { ArticleDocument, GymProduct } from "@/lib/types";
import { DisclosureNote } from "@/components/DisclosureNote";
import { ProductCard } from "@/components/ProductCard";

export function ArticleView({
  article,
  html,
  products,
}: {
  article: ArticleDocument;
  html: string;
  products: GymProduct[];
}) {
  const showAmazon = products.some((product) => amazonLink(product) != null);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-stone-500">{article.type}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{article.title}</h1>
        <p className="text-lg text-stone-700">{article.description}</p>
        <p className="text-sm text-stone-600">
          Published {article.publishedAt}. Updated {article.updatedAt}.
          {article.lastVerifiedDate ? ` Last verified ${article.lastVerifiedDate}.` : ""}
        </p>
        {article.testingStatus ? (
          <p className="text-sm text-stone-700">Testing status: {article.testingStatus}</p>
        ) : null}
        {article.constraintTags && article.constraintTags.length > 0 ? (
          <ul className="flex flex-wrap gap-2 text-sm">
            {article.constraintTags.map((tag) => (
              <li key={tag} className="border border-stone-300 px-2 py-0.5">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      {articleNeedsDisclosure(article) ? (
        <DisclosureNote includeAmazonStatement={showAmazon} />
      ) : null}
      {html.trim().length > 0 ? (
        <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-sm text-stone-600">This article has no body yet.</p>
      )}
      {products.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Linked equipment</h2>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : null}
    </article>
  );
}
