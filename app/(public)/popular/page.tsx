import type { Metadata } from "next";
import { ListPage } from "@/components/public/list-page";
import { listPopularArticles } from "@/lib/queries/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Popular",
  description: "Most-read articles this week and all time.",
  canonicalPath: "/popular",
});

export default async function PopularPage() {
  const articles = await listPopularArticles(24);

  return (
    <ListPage
      title="Popular"
      description="Top articles by 7-day and all-time views."
      breadcrumbLabel="Popular"
      articles={articles}
    />
  );
}
