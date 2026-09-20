import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export type PublicSiteSettings = {
  siteName: string;
  siteDescription: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
};

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const rows = await db.select().from(siteSettings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    siteName: String(map.site_name ?? process.env.NEXT_PUBLIC_SITE_NAME ?? "My Article Website"),
    siteDescription: String(map.site_description ?? ""),
    defaultSeoTitle: String(map.default_seo_title ?? map.site_name ?? "My Article Website"),
    defaultSeoDescription: String(map.default_seo_description ?? ""),
  };
}
