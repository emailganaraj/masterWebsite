import type { Metadata } from "next";
import { ArticleGrid } from "@/components/public/article-grid";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { listLatestArticles } from "@/lib/queries/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 120;

export const metadata: Metadata = buildPageMetadata({
  title: "Latest Articles",
  description: "Most recently published articles.",
  canonicalPath: "/latest",
});

export default async function LatestPage() {
  const articles = await listLatestArticles(24);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Latest" }]} />
      <h1 className="text-3xl font-bold text-zinc-900">Latest Articles</h1>
      <p className="mt-2 text-zinc-600">Most recently published stories.</p>
      <div className="mt-10">
        <ArticleGrid articles={articles} />
      </div>
    </div>
  );
}
