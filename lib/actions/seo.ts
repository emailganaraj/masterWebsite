"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getClientIp } from "@/lib/audit/client-ip";
import { logAudit } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { enqueueJob, JOB_NAMES } from "@/lib/jobs/boss";
import { regenerateSitemapCache } from "@/lib/seo/regenerate-sitemap";

export async function regenerateSitemap(): Promise<ActionResult> {
  const perm = await requirePermission("settings", "update");
  if (!perm.ok) return perm;

  regenerateSitemapCache();
  await enqueueJob(JOB_NAMES.REGENERATE_SITEMAP, {});

  const ip = await getClientIp();
  await logAudit({
    userId: perm.data.userId,
    action: "update",
    entityType: "sitemap",
    metadata: { action: "regenerate" },
    ipAddress: ip,
  });

  revalidatePath("/admin/seo");
  return ok(undefined);
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  const perm = await requirePermission("settings", "update");
  if (!perm.ok) return perm;

  try {
    const [row] = await db.select().from(redirects).where(eq(redirects.id, id)).limit(1);
    if (!row) return fail("Redirect not found.");

    await db.delete(redirects).where(eq(redirects.id, id));

    const ip = await getClientIp();
    await logAudit({
      userId: perm.data.userId,
      action: "delete",
      entityType: "redirect",
      entityId: id,
      metadata: { fromPath: row.fromPath, toPath: row.toPath },
      ipAddress: ip,
    });

    revalidatePath("/admin/seo");
    return ok(undefined);
  } catch {
    return fail("Could not delete redirect.");
  }
}
