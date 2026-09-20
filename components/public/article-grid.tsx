import type { ArticleCardData } from "@/lib/queries/articles";
import { ArticleCard } from "./article-card";

export function ArticleGrid({
  articles,
  emptyMessage = "No articles yet.",
}: {
  articles: ArticleCardData[];
  emptyMessage?: string;
}) {
  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
