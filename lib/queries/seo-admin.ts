import { listPublishedSlugs } from "@/lib/queries/articles";
import { listPublishedPageSlugs } from "@/lib/queries/pages";
import { listAllRedirects } from "@/lib/queries/redirects";
import { getPublicSiteSettings } from "@/lib/queries/site";
import {
  listAllAuthorSlugs,
  listAllCategorySlugs,
  listAllTagSlugs,
} from "@/lib/queries/taxonomy";
import { getSiteUrl } from "@/lib/seo/metadata";

export async function getSeoOverview() {
  const [
    settings,
    articleRows,
    categoryRows,
    tagRows,
    authorRows,
    pageRows,
    redirectRows,
  ] = await Promise.all([
    getPublicSiteSettings(),
    listPublishedSlugs(),
    listAllCategorySlugs(),
    listAllTagSlugs(),
    listAllAuthorSlugs(),
    listPublishedPageSlugs(),
    listAllRedirects(),
  ]);

  const base = getSiteUrl();
  const listPages = 4; // latest, trending, popular + homepage

  return {
    settings,
    siteUrl: base,
    sitemapUrl: `${base}/sitemap.xml`,
    robotsUrl: `${base}/robots.txt`,
    counts: {
      articles: articleRows.length,
      categories: categoryRows.length,
      tags: tagRows.length,
      authors: authorRows.length,
      pages: pageRows.length,
      redirects: redirectRows.length,
      sitemapEntries:
        listPages + articleRows.length + categoryRows.length + tagRows.length + authorRows.length + pageRows.length,
    },
    redirects: redirectRows.slice(0, 50),
  };
}
