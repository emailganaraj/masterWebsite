import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";

export async function getPublishedPageBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.status, "published")))
    .limit(1);
  return row ?? null;
}

export async function listPublishedPageSlugs() {
  return db
    .select({ slug: pages.slug, updatedAt: pages.updatedAt })
    .from(pages)
    .where(eq(pages.status, "published"));
}
