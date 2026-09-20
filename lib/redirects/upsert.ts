import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { articlePath } from "./chain";
import { resolveRedirectTarget } from "./resolve";

export { articlePath };

/** Create or update a 301 redirect when a published article slug changes. */
export async function upsertArticleSlugRedirect(oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;

  const fromPath = articlePath(oldSlug);
  const toPath = articlePath(newSlug);
  const resolvedTo = await resolveRedirectTarget(toPath);

  // Point any redirects that targeted the old path to the new destination.
  await db
    .update(redirects)
    .set({ toPath: resolvedTo })
    .where(eq(redirects.toPath, fromPath));

  await db
    .insert(redirects)
    .values({ fromPath, toPath: resolvedTo, statusCode: 301 })
    .onConflictDoUpdate({
      target: redirects.fromPath,
      set: { toPath: resolvedTo, statusCode: 301 },
    });

  revalidateTag("redirects");
}
