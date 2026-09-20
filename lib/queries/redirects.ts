import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";

export type RedirectLookup = {
  toPath: string;
  statusCode: number;
};

async function fetchRedirect(path: string): Promise<RedirectLookup | null> {
  const normalized = path.split("?")[0] || path;

  const [row] = await db
    .select({ toPath: redirects.toPath, statusCode: redirects.statusCode })
    .from(redirects)
    .where(eq(redirects.fromPath, normalized))
    .limit(1);

  if (!row) return null;
  return { toPath: row.toPath, statusCode: row.statusCode };
}

export async function lookupRedirect(path: string): Promise<RedirectLookup | null> {
  return unstable_cache(
    () => fetchRedirect(path),
    [`redirect-${path}`],
    { revalidate: 60, tags: ["redirects"] },
  )();
}

export async function listAllRedirects() {
  return db.select().from(redirects).orderBy(redirects.createdAt);
}
