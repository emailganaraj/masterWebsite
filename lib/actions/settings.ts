"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export type SiteSettingsForm = {
  siteName: string;
  siteDescription: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  timezone: string;
  socialProfiles: Record<string, string>;
};

const KEYS = {
  siteName: "site_name",
  siteDescription: "site_description",
  defaultSeoTitle: "default_seo_title",
  defaultSeoDescription: "default_seo_description",
  timezone: "timezone",
  socialProfiles: "social_profiles",
} as const;

export async function getSiteSettings(): Promise<SiteSettingsForm> {
  const rows = await db.select().from(siteSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    siteName: String(map[KEYS.siteName] ?? ""),
    siteDescription: String(map[KEYS.siteDescription] ?? ""),
    defaultSeoTitle: String(map[KEYS.defaultSeoTitle] ?? ""),
    defaultSeoDescription: String(map[KEYS.defaultSeoDescription] ?? ""),
    timezone: String(map[KEYS.timezone] ?? "UTC"),
    socialProfiles: (map[KEYS.socialProfiles] as Record<string, string>) ?? {},
  };
}

export async function updateSiteSettings(
  input: SiteSettingsForm,
): Promise<ActionResult> {
  const perm = await requirePermission("settings", "update");
  if (!perm.ok) return perm;

  const entries: { key: string; value: unknown }[] = [
    { key: KEYS.siteName, value: input.siteName.trim() },
    { key: KEYS.siteDescription, value: input.siteDescription.trim() },
    { key: KEYS.defaultSeoTitle, value: input.defaultSeoTitle.trim() },
    { key: KEYS.defaultSeoDescription, value: input.defaultSeoDescription.trim() },
    { key: KEYS.timezone, value: input.timezone.trim() || "UTC" },
    { key: KEYS.socialProfiles, value: input.socialProfiles ?? {} },
  ];

  try {
    for (const entry of entries) {
      await db
        .insert(siteSettings)
        .values({ key: entry.key, value: entry.value })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: entry.value, updatedAt: new Date() },
        });
    }

    revalidatePath("/admin/settings");
    return ok(undefined);
  } catch {
    return fail("Could not save settings.");
  }
}

export async function getSettingValue(key: string): Promise<unknown> {
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  return row?.value;
}
