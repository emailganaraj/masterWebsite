import { pool } from "@/lib/db";

/** Recalculate rolling view windows from raw events. */
export async function decayViewWindows() {
  if (!pool) return;

  await pool.query(`
    UPDATE article_stats AS s
    SET
      views_2h = COALESCE(sub.v2h, 0),
      views_24h = COALESCE(sub.v24h, 0),
      views_7d = COALESCE(sub.v7d, 0),
      views_total = COALESCE(sub.vtotal, 0),
      updated_at = NOW()
    FROM (
      SELECT
        article_id,
        COUNT(*) FILTER (WHERE occurred_at > NOW() - INTERVAL '2 hours') AS v2h,
        COUNT(*) FILTER (WHERE occurred_at > NOW() - INTERVAL '24 hours') AS v24h,
        COUNT(*) FILTER (WHERE occurred_at > NOW() - INTERVAL '7 days') AS v7d,
        COUNT(*) AS vtotal
      FROM analytics_events
      WHERE article_id IS NOT NULL
      GROUP BY article_id
    ) AS sub
    WHERE s.article_id = sub.article_id
  `);
}
