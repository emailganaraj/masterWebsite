import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents, articleStats, articles } from "@/lib/db/schema";

export async function recordPageView(input: {
  articleId?: string | null;
  path: string;
  sessionId: string;
  referrer?: string | null;
  device?: string | null;
}) {
  await db.insert(analyticsEvents).values({
    sessionId: input.sessionId,
    articleId: input.articleId ?? null,
    path: input.path,
    referrer: input.referrer ?? null,
    device: input.device ?? null,
  });

  if (!input.articleId) return;

  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, input.articleId))
    .limit(1);

  if (!article) return;

  await db
    .insert(articleStats)
    .values({
      articleId: input.articleId,
      viewsTotal: 1,
      views7d: 1,
      views24h: 1,
      views2h: 1,
    })
    .onConflictDoUpdate({
      target: articleStats.articleId,
      set: {
        viewsTotal: sql`${articleStats.viewsTotal} + 1`,
        views7d: sql`${articleStats.views7d} + 1`,
        views24h: sql`${articleStats.views24h} + 1`,
        views2h: sql`${articleStats.views2h} + 1`,
        updatedAt: new Date(),
      },
    });
}
