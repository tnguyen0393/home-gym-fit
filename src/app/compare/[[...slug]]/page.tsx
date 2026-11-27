import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/ArticleList";
import { ArticleView } from "@/components/ArticleView";
import { JsonLd } from "@/components/JsonLd";
import {
  getComparison,
  listComparisons,
  productsForArticle,
  renderMarkdown,
} from "@/lib/content";
import { pageListJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/site";
import type { ArticleDocument } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: [] }, ...listComparisons().map((article) => ({ slug: [article.slug] }))];
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) {
    return pageMetadata(
      "Comparisons",
      "Side-by-side comparisons using published manufacturer dimensions.",
      "/compare/",
    );
  }
  const article = slug.length === 1 ? getComparison(slug[0]) : undefined;
  if (!article) return {};
  return pageMetadata(article.title, article.description, `/compare/${article.slug}/`);
}

function CompareIndex({ articles }: { articles: ArticleDocument[] }) {
  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={pageListJsonLd(
          "Comparisons",
          articles.map((article) => ({
            title: article.title,
            path: `/compare/${article.slug}/`,
          })),
        )}
      />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Comparisons</h1>
        <p className="max-w-prose text-stone-700">
          Side-by-side comparisons using published manufacturer dimensions.
        </p>
      </header>
      {articles.length === 0 ? (
        <p>No comparisons have been published yet.</p>
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  );
}

export default async function CompareRoute(props: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return <CompareIndex articles={listComparisons()} />;
  if (slug.length !== 1) notFound();
  const article = getComparison(slug[0]);
  if (!article) notFound();
  const rendered = await renderMarkdown(article.body);
  return (
    <ArticleView
      article={article}
      html={rendered.html}
      headings={rendered.headings}
      products={productsForArticle(article)}
    />
  );
}
