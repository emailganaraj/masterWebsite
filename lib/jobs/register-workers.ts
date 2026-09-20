import type { PgBoss } from "pg-boss";
import { aggregateAnalyticsDaily } from "@/lib/analytics/aggregate-daily";
import { decayViewWindows } from "@/lib/analytics/decay-view-windows";
import { recordPageView } from "@/lib/analytics/record-view";
import { recomputeTrendingScores } from "@/lib/analytics/recompute-scores";
import { publishDueScheduledArticles } from "@/lib/articles/scheduled";
import { regenerateSitemapCache } from "@/lib/seo/regenerate-sitemap";
import { JOB_NAMES } from "./boss";

export type PageViewJobData = {
  articleId?: string | null;
  path: string;
  sessionId: string;
  referrer?: string | null;
  device?: string | null;
  country?: string | null;
};

export async function registerWorkers(boss: PgBoss) {
  await boss.work<PageViewJobData>(JOB_NAMES.RECORD_PAGE_VIEW, async (jobs) => {
    for (const job of jobs) {
      await recordPageView(job.data);
    }
  });

  await boss.work(JOB_NAMES.RECOMPUTE_TRENDING, async () => {
    await recomputeTrendingScores();
  });

  await boss.work(JOB_NAMES.DECAY_VIEW_WINDOWS, async () => {
    await decayViewWindows();
    await recomputeTrendingScores();
  });

  await boss.work(JOB_NAMES.AGGREGATE_ANALYTICS, async () => {
    await aggregateAnalyticsDaily();
  });

  await boss.work(JOB_NAMES.PUBLISH_SCHEDULED, async () => {
    await publishDueScheduledArticles();
  });

  await boss.work(JOB_NAMES.REGENERATE_SITEMAP, async () => {
    regenerateSitemapCache();
  });
}

export async function registerSchedules(boss: PgBoss) {
  await boss.schedule(JOB_NAMES.RECOMPUTE_TRENDING, "*/5 * * * *");
  await boss.schedule(JOB_NAMES.DECAY_VIEW_WINDOWS, "0 * * * *");
  await boss.schedule(JOB_NAMES.AGGREGATE_ANALYTICS, "0 1 * * *");
  await boss.schedule(JOB_NAMES.PUBLISH_SCHEDULED, "* * * * *");
}
