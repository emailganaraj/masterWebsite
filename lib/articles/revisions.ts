import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articleRevisions, articles } from "@/lib/db/schema";

export async function getNextRevisionVersion(articleId: string): Promise<number> {
  const [latest] = await db
    .select({ version: articleRevisions.version })
    .from(articleRevisions)
    .where(eq(articleRevisions.articleId, articleId))
    .orderBy(desc(articleRevisions.version))
    .limit(1);

  return (latest?.version ?? 0) + 1;
}

export async function createArticleRevision(
  articleId: string,
  editorId: string,
  changeSummary?: string,
) {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article) throw new Error("Article not found");

  const version = await getNextRevisionVersion(articleId);

  await db.insert(articleRevisions).values({
    articleId,
    version,
    snapshot: article as unknown as Record<string, unknown>,
    editorId,
    changeSummary: changeSummary ?? `Version ${version}`,
  });

  return version;
}
