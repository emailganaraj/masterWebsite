import { eq } from "drizzle-orm";
import { getTrendingWeights } from "./weights";
import { db, pool } from "@/lib/db";
import { articles, articleStats } from "@/lib/db/schema";

/** Ensure every published article has an article_stats row. */
export async function ensureArticleStatsRows() {
  const published = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.status, "published"));

  for (const row of published) {
    await db
      .insert(articleStats)
      .values({ articleId: row.id })
      .onConflictDoNothing();
  }
}

/** Recompute trending_score for all published articles. */
export async function recomputeTrendingScores() {
  if (!pool) return;

  await ensureArticleStatsRows();
  const weights = await getTrendingWeights();

  await pool.query(
    `UPDATE article_stats AS s
     SET trending_score = (
       (s.views_2h * $1 + s.views_24h * $2)::float /
       POWER(GREATEST(EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 3600.0 + 2, 1), $3)
     ),
     updated_at = NOW()
     FROM articles AS a
     WHERE a.id = s.article_id
       AND a.status = 'published'
       AND a.published_at IS NOT NULL`,
    [weights.views2hWeight, weights.views24hWeight, weights.gravity],
  );
}
