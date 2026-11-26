import Link from "next/link";
import { articleTypeLabel, formatDisplayDate } from "@/lib/format";
import type { ArticleDocument } from "@/lib/types";

function articlePath(article: ArticleDocument): string {
  const base = article.type === "compare" ? "/compare" : "/guides";
  return `${base}/${article.slug}/`;
}

export function ArticleList({ articles }: { articles: ArticleDocument[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link
            href={articlePath(article)}
            className="group flex h-full flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50/60"
          >
            <span className="text-xs font-medium tracking-wide text-indigo-800 uppercase">
              {articleTypeLabel(article.type)}
            </span>
            <span className="text-lg font-semibold text-stone-950 group-hover:text-indigo-800">
              {article.title} <span aria-hidden="true">→</span>
            </span>
            <span className="line-clamp-3 text-sm text-stone-600">{article.description}</span>
            <span className="mt-auto text-sm text-stone-500">
              Updated {formatDisplayDate(article.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
