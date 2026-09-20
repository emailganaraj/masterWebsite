import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { ArticleCardData } from "./articles";
import { getMediaById } from "./media";

export async function searchPublishedArticles(
  query: string,
  limit = 20,
): Promise<ArticleCardData[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const rows = await db.execute<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: Date | null;
    featured_media_id: string | null;
    category_name: string | null;
    category_slug: string | null;
    author_name: string | null;
    author_slug: string | null;
    rank: number;
  }>(sql`
    SELECT
      a.id,
      a.slug,
      a.title,
      a.excerpt,
      a.published_at,
      a.featured_media_id,
      c.name AS category_name,
      c.slug AS category_slug,
      au.name AS author_name,
      au.slug AS author_slug,
      ts_rank(a.search_vector, websearch_to_tsquery('english', ${trimmed})) AS rank
    FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    LEFT JOIN authors au ON au.id = a.author_id
    WHERE a.status = 'published'
      AND a.search_vector @@ websearch_to_tsquery('english', ${trimmed})
    ORDER BY rank DESC, a.published_at DESC
    LIMIT ${limit}
  `);

  return Promise.all(
    rows.rows.map(async (row) => {
      const media = await getMediaById(row.featured_media_id);
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        publishedAt: row.published_at,
        category:
          row.category_slug && row.category_name
            ? { name: row.category_name, slug: row.category_slug }
            : null,
        author:
          row.author_slug && row.author_name
            ? { name: row.author_name, slug: row.author_slug }
            : null,
        featuredImageUrl: media?.url ?? null,
      };
    }),
  );
}
