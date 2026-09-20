import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";

/** Follow redirect chain to final destination (prevents A→B→C chains). */
export async function resolveRedirectTarget(toPath: string): Promise<string> {
  let current = toPath;
  const visited = new Set<string>();

  for (let i = 0; i < 10; i++) {
    if (visited.has(current)) break;
    visited.add(current);

    const [row] = await db
      .select({ toPath: redirects.toPath })
      .from(redirects)
      .where(eq(redirects.fromPath, current))
      .limit(1);

    if (!row) break;
    current = row.toPath;
  }

  return current;
}
