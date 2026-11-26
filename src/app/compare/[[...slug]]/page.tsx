import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import {
  getComparison,
  listComparisons,
  productsForArticle,
  renderMarkdown,
} from "@/lib/content";
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
    return {
      title: "Comparisons",
      description: "Comparisons published from content/compare.",
      alternates: { canonical: "/compare/" },
    };
  }
  const article = slug.length === 1 ? getComparison(slug[0]) : undefined;
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/compare/${article.slug}/` },
  };
}

function CompareIndex({ articles }: { articles: ArticleDocument[] }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Comparisons</h1>
        <p className="max-w-3xl text-stone-700">
          Comparisons are loaded from content/compare as Markdown or MDX. None are included until
          Guide & Comparison Editor adds them.
        </p>
      </header>
      {articles.length === 0 ? (
        <p>No comparisons have been published yet.</p>
      ) : (
        <ul className="grid gap-3">
          {articles.map((article) => (
            <li key={article.slug} className="border border-stone-300 bg-white p-4">
              <h2 className="text-lg font-semibold">
                <Link href={`/compare/${article.slug}/`} className="underline decoration-stone-300">
                  {article.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-stone-700">{article.description}</p>
              <p className="mt-1 text-sm text-stone-500">Updated {article.updatedAt}</p>
            </li>
          ))}
        </ul>
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
  const html = await renderMarkdown(article.body);
  return <ArticleView article={article} html={html} products={productsForArticle(article)} />;
}
