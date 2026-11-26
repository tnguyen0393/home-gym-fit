import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/ArticleList";
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
      description: "Fit guides that use manufacturer spec sheets to answer a room constraint.",
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
        <p className="max-w-prose text-stone-700">
          Fit guides that use manufacturer spec sheets to answer a room constraint.
        </p>
      </header>
      {articles.length === 0 ? (
        <p>No guides have been published yet.</p>
      ) : (
        <ArticleList articles={articles} />
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
