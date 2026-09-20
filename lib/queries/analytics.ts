import { desc, eq, gte, sql } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { analyticsEvents, articles, articleStats } from "@/lib/db/schema";

export type TrafficDay = { date: string; pageviews: number; visitors: number };

export type TopArticle = {
  id: string;
  title: string;
  slug: string;
  viewsTotal: number;
  trendingScore: number;
};

export type BreakdownRow = { label: string; value: number };

export async function getAnalyticsOverview(days = 7) {
  const since = new Date(Date.now() - days * 86_400_000);

  const [eventStats] = await db
    .select({
      pageviews: sql<number>`count(*)::int`,
      visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.occurredAt, since));

  const [totalViews] = await db
    .select({ total: sql<number>`coalesce(sum(${articleStats.viewsTotal}), 0)::int` })
    .from(articleStats);

  return {
    pageviews: eventStats?.pageviews ?? 0,
    uniqueVisitors: eventStats?.visitors ?? 0,
    totalArticleViews: totalViews?.total ?? 0,
    days,
  };
}

export async function getTrafficByDay(days = 14): Promise<TrafficDay[]> {
  if (!pool) return [];

  const result = await pool.query<{ date: string; pageviews: string; visitors: string }>(
    `
    SELECT
      d::date::text AS date,
      COALESCE(p.value, 0)::int AS pageviews,
      COALESCE(v.value, 0)::int AS visitors
    FROM generate_series(
      (CURRENT_DATE - $1::int + 1),
      CURRENT_DATE,
      '1 day'::interval
    ) AS d
    LEFT JOIN analytics_daily_rollups p
      ON p.date = d::date AND p.metric = 'pageviews_total'
    LEFT JOIN analytics_daily_rollups v
      ON v.date = d::date AND v.metric = 'unique_visitors'
    ORDER BY d
    `,
    [days],
  );

  if (result.rows.length > 0 && result.rows.some((r) => Number(r.pageviews) > 0)) {
    return result.rows.map((r) => ({
      date: r.date,
      pageviews: Number(r.pageviews),
      visitors: Number(r.visitors),
    }));
  }

  const fallback = await pool.query<{ date: string; pageviews: string; visitors: string }>(
    `
    SELECT
      occurred_at::date::text AS date,
      COUNT(*)::int AS pageviews,
      COUNT(DISTINCT session_id)::int AS visitors
    FROM analytics_events
    WHERE occurred_at >= CURRENT_DATE - $1::int
    GROUP BY occurred_at::date
    ORDER BY date
    `,
    [days],
  );

  return fallback.rows.map((r) => ({
    date: r.date,
    pageviews: Number(r.pageviews),
    visitors: Number(r.visitors),
  }));
}

export async function getTopArticles(limit = 10): Promise<TopArticle[]> {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      viewsTotal: articleStats.viewsTotal,
      trendingScore: articleStats.trendingScore,
    })
    .from(articleStats)
    .innerJoin(articles, eq(articles.id, articleStats.articleId))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articleStats.viewsTotal))
    .limit(limit);

  return rows;
}

export async function getTopReferrers(limit = 10, days = 7): Promise<BreakdownRow[]> {
  const since = new Date(Date.now() - days * 86_400_000);

  const rows = await db
    .select({
      label: sql<string>`coalesce(nullif(${analyticsEvents.referrer}, ''), '(direct)')`,
      value: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.occurredAt, since))
    .groupBy(sql`coalesce(nullif(${analyticsEvents.referrer}, ''), '(direct)')`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return rows;
}

export async function getDeviceBreakdown(days = 7): Promise<BreakdownRow[]> {
  const since = new Date(Date.now() - days * 86_400_000);

  const rows = await db
    .select({
      label: sql<string>`coalesce(${analyticsEvents.device}, 'unknown')`,
      value: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.occurredAt, since))
    .groupBy(sql`coalesce(${analyticsEvents.device}, 'unknown')`)
    .orderBy(desc(sql`count(*)`));

  return rows;
}

export async function getRecentEventCount(hours = 24) {
  const since = new Date(Date.now() - hours * 3_600_000);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.occurredAt, since));
  return row?.count ?? 0;
}
