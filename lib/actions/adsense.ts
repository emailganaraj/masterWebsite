"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { adSlots, siteSettings } from "@/lib/db/schema";
import { listAllAdSlots } from "@/lib/queries/ad-slots";

export type AdSlotForm = {
  enabled: boolean;
  slotUnitId: string;
};

export type AdSenseSettings = {
  publisherId: string;
};

export async function listAdSlotsForAdmin() {
  const perm = await requirePermission("adsense", "read");
  if (!perm.ok) return [];

  return listAllAdSlots();
}

export async function getAdSenseSettings(): Promise<AdSenseSettings> {
  const perm = await requirePermission("adsense", "read");
  if (!perm.ok) return { publisherId: "" };

  const envId = process.env.ADSENSE_PUBLISHER_ID ?? "";
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "adsense_publisher_id"))
    .limit(1);

  return {
    publisherId: row?.value ? String(row.value) : envId,
  };
}

export async function updateAdSlot(
  id: string,
  input: AdSlotForm,
): Promise<ActionResult> {
  const perm = await requirePermission("adsense", "configure");
  if (!perm.ok) return perm;

  try {
    const [existing] = await db.select().from(adSlots).where(eq(adSlots.id, id)).limit(1);
    if (!existing) return fail("Ad slot not found.");

    const config = {
      ...(existing.config ?? {}),
      slotUnitId: input.slotUnitId.trim(),
    };

    await db
      .update(adSlots)
      .set({
        enabled: input.enabled,
        config,
        updatedAt: new Date(),
      })
      .where(eq(adSlots.id, id));

    revalidateTag(`ad-slot:${existing.placement}`);
    revalidatePath("/admin/adsense");
    return ok(undefined);
  } catch {
    return fail("Could not update ad slot.");
  }
}

export async function updateAdSenseSettings(input: AdSenseSettings): Promise<ActionResult> {
  const perm = await requirePermission("adsense", "configure");
  if (!perm.ok) return perm;

  try {
    await db
      .insert(siteSettings)
      .values({ key: "adsense_publisher_id", value: input.publisherId.trim() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: input.publisherId.trim(), updatedAt: new Date() },
      });

    revalidatePath("/admin/adsense");
    return ok(undefined);
  } catch {
    return fail("Could not save AdSense settings.");
  }
}
