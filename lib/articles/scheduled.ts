import { and, eq, lte } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { articles } from "@/lib/db/schema";

/** Publish articles whose scheduled_at has passed. Called on admin article list load. */
export async function publishDueScheduledArticles(): Promise<number> {
  const now = new Date();

  const due = await db
    .select({ id: articles.id })
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
