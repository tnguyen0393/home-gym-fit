import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { JsonLd } from "@/components/JsonLd";
import { getGuide, listGuides, productsForArticle, renderMarkdown } from "@/lib/content";
import { pageListJsonLd } from "@/lib/jsonld";
import type { ArticleDocument } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: [] }, ...listGuides().map((article) => ({ slug: [article.slug] }))];
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) {
    return {
      title: "Guides",
      description: "Guides and explainers published from content/guides.",
      alternates: { canonical: "/guides/" },
    };
  }
  const article = slug.length === 1 ? getGuide(slug[0]) : undefined;
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/guides/${article.slug}/` },
  };
}

function GuideIndex({ articles }: { articles: ArticleDocument[] }) {
  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={pageListJsonLd(
          "Guides",
          articles.map((article) => ({
            title: article.title,
            path: `/guides/${article.slug}/`,
          })),
        )}
      />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Guides</h1>
        <p className="max-w-3xl text-stone-700">
          Guides and explainers are loaded from content/guides as Markdown or MDX.
        </p>
      </header>
      {articles.length === 0 ? (
        <p>No guides have been published yet.</p>
      ) : (
        <ul className="grid gap-3">
          {articles.map((article) => (
            <li key={article.slug} className="border border-stone-300 bg-white p-4">
              <p className="text-sm uppercase tracking-wide text-stone-500">{article.type}</p>
              <h2 className="text-lg font-semibold">
                <Link href={`/guides/${article.slug}/`} className="underline decoration-stone-300">
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

export default async function GuidesRoute(props: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return <GuideIndex articles={listGuides()} />;
  if (slug.length !== 1) notFound();
  const article = getGuide(slug[0]);
  if (!article) notFound();
  const html = await renderMarkdown(article.body);
  return <ArticleView article={article} html={html} products={productsForArticle(article)} />;
}
