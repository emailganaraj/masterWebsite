import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import type { ArticleCardData } from "@/lib/queries/articles";

export function ListPage({
  title,
  description,
  articles,
  breadcrumbLabel,
}: {
  title: string;
  description: string;
  articles: ArticleCardData[];
  breadcrumbLabel: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: breadcrumbLabel }]} />
      <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
      <p className="mt-2 text-zinc-600">{description}</p>
      <div className="mt-10">
        <ArticleGrid articles={articles} />
      </div>
    </div>
  );
}
