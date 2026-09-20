import { eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { analyticsDailyRollups } from "@/lib/db/schema";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Aggregate analytics_events into analytics_daily_rollups for a given date. */
export async function aggregateAnalyticsDaily(forDate?: Date) {
  if (!pool) return;

  const target = forDate ?? new Date(Date.now() - 86_400_000);
  const dateStr = formatDate(target);

  await db.delete(analyticsDailyRollups).where(eq(analyticsDailyRollups.date, dateStr));

  await pool.query(
    `
    INSERT INTO analytics_daily_rollups (date, path, metric, value)
    SELECT $1::date, path, 'pageviews', COUNT(*)::int
    FROM analytics_events
    WHERE occurred_at >= $1::date
      AND occurred_at < ($1::date + INTERVAL '1 day')
    GROUP BY path
    `,
    [dateStr],
  );

  await pool.query(
    `
    INSERT INTO analytics_daily_rollups (date, article_id, metric, value)
    SELECT $1::date, article_id, 'pageviews', COUNT(*)::int
    FROM analytics_events
    WHERE article_id IS NOT NULL
      AND occurred_at >= $1::date
      AND occurred_at < ($1::date + INTERVAL '1 day')
    GROUP BY article_id
    `,
    [dateStr],
  );

  await pool.query(
    `
    INSERT INTO analytics_daily_rollups (date, metric, value)
    SELECT $1::date, 'pageviews_total', COUNT(*)::int
    FROM analytics_events
    WHERE occurred_at >= $1::date
      AND occurred_at < ($1::date + INTERVAL '1 day')
    `,
    [dateStr],
  );

  await pool.query(
    `
    INSERT INTO analytics_daily_rollups (date, metric, value)
    SELECT $1::date, 'unique_visitors', COUNT(DISTINCT session_id)::int
    FROM analytics_events
    WHERE occurred_at >= $1::date
      AND occurred_at < ($1::date + INTERVAL '1 day')
    `,
    [dateStr],
  );

  await pool.query(
    `
    INSERT INTO analytics_daily_rollups (date, path, metric, value)
    SELECT $1::date, COALESCE(NULLIF(referrer, ''), '(direct)'), 'referrer', COUNT(*)::int
    FROM analytics_events
    WHERE occurred_at >= $1::date
      AND occurred_at < ($1::date + INTERVAL '1 day')
    GROUP BY COALESCE(NULLIF(referrer, ''), '(direct)')
    `,
    [dateStr],
  );

  await pool.query(
    `
    INSERT INTO analytics_daily_rollups (date, path, metric, value)
    SELECT $1::date, COALESCE(device, 'unknown'), 'device', COUNT(*)::int
    FROM analytics_events
    WHERE occurred_at >= $1::date
      AND occurred_at < ($1::date + INTERVAL '1 day')
    GROUP BY COALESCE(device, 'unknown')
    `,
    [dateStr],
  );
}
