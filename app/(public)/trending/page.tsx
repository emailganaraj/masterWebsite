import type { Metadata } from "next";
import { ListPage } from "@/components/public/list-page";
import { recomputeTrendingScores } from "@/lib/analytics/recompute-scores";
import { listTrendingArticles } from "@/lib/queries/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Trending",
  description: "Stories gaining momentum right now.",
  canonicalPath: "/trending",
});

export default async function TrendingPage() {
  await recomputeTrendingScores();
  const articles = await listTrendingArticles(24);

  return (
    <ListPage
      title="Trending"
      description="Articles ranked by recent views and publish recency."
      breadcrumbLabel="Trending"
      articles={articles}
    />
  );
}
