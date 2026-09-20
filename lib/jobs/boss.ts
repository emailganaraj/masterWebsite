/**
 * pg-boss job queue stub — full implementation in Phase 2.
 * Avoids pg-boss npm dependency during Phase 1 install.
 */

export const JOB_NAMES = {
  PUBLISH_SCHEDULED: "publish-scheduled-articles",
  RECOMPUTE_TRENDING: "recompute-trending-scores",
  AGGREGATE_ANALYTICS: "aggregate-analytics-daily",
  REGENERATE_SITEMAP: "regenerate-sitemap",
} as const;

export async function getJobBoss(): Promise<never> {
  throw new Error(
    "pg-boss is not installed yet. Add pg-boss in Phase 2 for scheduled publishing.",
  );
}
