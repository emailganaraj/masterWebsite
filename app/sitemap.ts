import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/lib/queries/articles";
import {
  listAllAuthorSlugs,
  listAllCategorySlugs,
  listAllTagSlugs,
} from "@/lib/queries/taxonomy";
import { listPublishedPageSlugs } from "@/lib/queries/pages";
import { getSiteUrl } from "@/lib/seo/metadata";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [articleRows, categoryRows, tagRows, authorRows, pageRows] =
    await Promise.all([
      listPublishedSlugs(),
      listAllCategorySlugs(),
      listAllTagSlugs(),
      listAllAuthorSlugs(),
      listPublishedPageSlugs(),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/latest`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/trending`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/popular`, changeFrequency: "hourly", priority: 0.8 },
  ];

  return [
    ...staticRoutes,
    ...articleRows.map((row) => ({
      url: `${base}/article/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...categoryRows.map((row) => ({
      url: `${base}/category/${row.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...tagRows.map((row) => ({
      url: `${base}/tag/${row.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...authorRows.map((row) => ({
      url: `${base}/author/${row.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...pageRows.map((row) => ({
      url: `${base}/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
