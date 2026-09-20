import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ListPage } from "@/components/public/list-page";
import { READ_COOKIE_NAME, parseReadCookie } from "@/lib/analytics/read-cookie";
import { listRecommendedArticles } from "@/lib/queries/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  title: "Recommended for You",
  description: "Personalized picks based on trending stories you have not read yet.",
  canonicalPath: "/recommended",
  noindex: true,
});

export default async function RecommendedPage() {
  const cookieStore = await cookies();
  const readIds = parseReadCookie(cookieStore.get(READ_COOKIE_NAME)?.value);
  const articles = await listRecommendedArticles(24, readIds);

  return (
    <ListPage
      title="Recommended for You"
      description={
        readIds.length > 0
          ? "Trending articles excluding ones you have already read."
          : "Start reading articles to get personalized recommendations."
      }
      breadcrumbLabel="Recommended"
      articles={articles}
    />
  );
}
