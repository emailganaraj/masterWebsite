import { and, eq, lte } from "drizzle-orm";
import { logAudit } from "@/lib/audit/log";
import { db, pool } from "@/lib/db";
import { articles, categories } from "@/lib/db/schema";
import { revalidatePublishedArticle } from "@/lib/seo/revalidate-public";

/** Publish articles whose scheduled_at has passed. */
export async function publishDueScheduledArticles(): Promise<number> {
  const now = new Date();

  const due = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      categoryId: articles.categoryId,
    })
    .from(articles)
    .where(
      and(
        eq(articles.status, "scheduled"),
        lte(articles.scheduledAt, now),
      ),
    );

  if (due.length === 0) return 0;

  for (const row of due) {
    await db
      .update(articles)
      .set({
        status: "published",
        publishedAt: now,
        updatedContentAt: now,
        updatedAt: now,
        scheduledAt: null,
      })
      .where(eq(articles.id, row.id));

    await updateSearchVector(row.id);

    let categorySlug: string | null = null;
    if (row.categoryId) {
      const [cat] = await db
        .select({ slug: categories.slug })
        .from(categories)
        .where(eq(categories.id, row.categoryId))
        .limit(1);
      categorySlug = cat?.slug ?? null;
    }

    revalidatePublishedArticle(row.slug, categorySlug);

    await logAudit({
      action: "publish",
      entityType: "article",
      entityId: row.id,
      metadata: { source: "scheduled", slug: row.slug },
    });
  }

  return due.length;
}

export async function updateSearchVector(articleId: string): Promise<void> {
  if (!pool) return;

  await pool.query(
    `UPDATE articles
     SET search_vector = to_tsvector('english',
       coalesce(title, '') || ' ' ||
       coalesce(subtitle, '') || ' ' ||
       coalesce(excerpt, '') || ' ' ||
       coalesce(body_text, '')
     )
     WHERE id = $1`,
    [articleId],
  );
}
