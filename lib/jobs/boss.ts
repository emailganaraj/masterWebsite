import { PgBoss } from "pg-boss";

export const JOB_NAMES = {
  RECORD_PAGE_VIEW: "record-page-view",
  PUBLISH_SCHEDULED: "publish-scheduled-articles",
  RECOMPUTE_TRENDING: "recompute-trending-scores",
  AGGREGATE_ANALYTICS: "aggregate-analytics-daily",
  DECAY_VIEW_WINDOWS: "decay-view-windows",
  REGENERATE_SITEMAP: "regenerate-sitemap",
} as const;

const globalForBoss = globalThis as unknown as {
  boss: PgBoss | null;
  bossPromise: Promise<PgBoss | null> | null;
};

function canUseBoss() {
  return process.env.USE_PGLITE !== "1" && Boolean(process.env.DATABASE_URL);
}

/** Producer-only boss instance for enqueueing from the Next.js app. */
export async function getJobBoss(): Promise<PgBoss | null> {
  if (!canUseBoss()) return null;

  if (globalForBoss.boss) return globalForBoss.boss;

  globalForBoss.bossPromise ??= (async () => {
    try {
      const boss = new PgBoss({
        connectionString: process.env.DATABASE_URL!,
        schema: "pgboss",
      });
      await boss.start();
      globalForBoss.boss = boss;
      return boss;
    } catch {
      return null;
    }
  })();

  return globalForBoss.bossPromise;
}

export async function enqueueJob(name: string, data: object): Promise<boolean> {
  const boss = await getJobBoss();
  if (!boss) return false;

  try {
    await boss.send(name, data);
    return true;
  } catch {
    return false;
  }
}

export async function createWorkerBoss(): Promise<PgBoss> {
  if (!canUseBoss()) {
    throw new Error("pg-boss requires PostgreSQL (USE_PGLITE=0 and DATABASE_URL).");
  }

  const boss = new PgBoss({
    connectionString: process.env.DATABASE_URL!,
    schema: "pgboss",
  });
  await boss.start();
  return boss;
}
