import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";

export type AdSlotData = {
  id: string;
  placement: string;
  enabled: boolean;
  type: "adsense" | "direct" | "affiliate" | "sponsored";
  config: Record<string, unknown>;
};

async function fetchAdSlotByPlacement(placement: string): Promise<AdSlotData | null> {
  const [row] = await db
    .select()
    .from(adSlots)
    .where(eq(adSlots.placement, placement))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    placement: row.placement,
    enabled: row.enabled,
    type: row.type,
    config: row.config ?? {},
  };
}

export async function getAdSlotByPlacement(placement: string) {
  return unstable_cache(
    () => fetchAdSlotByPlacement(placement),
    [`ad-slot-${placement}`],
    { revalidate: 300, tags: [`ad-slot:${placement}`] },
  )();
}

export async function listAllAdSlots(): Promise<AdSlotData[]> {
  const rows = await db.select().from(adSlots).orderBy(adSlots.placement);
  return rows.map((row) => ({
    id: row.id,
    placement: row.placement,
    enabled: row.enabled,
    type: row.type,
    config: row.config ?? {},
  }));
}
