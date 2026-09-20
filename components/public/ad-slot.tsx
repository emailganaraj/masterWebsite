import { AdSlotClient } from "@/components/public/ad-slot-client";
import { getAdSlotByPlacement } from "@/lib/queries/ad-slots";
import { getSettingValue } from "@/lib/queries/site";

export async function AdSlot({ placement }: { placement: string }) {
  const slot = await getAdSlotByPlacement(placement);
  if (!slot?.enabled || slot.type !== "adsense") return null;

  const envPublisherId = process.env.ADSENSE_PUBLISHER_ID ?? "";
  const dbPublisherId = String((await getSettingValue("adsense_publisher_id")) ?? "");
  const publisherId = dbPublisherId || envPublisherId;
  const slotUnitId = String(slot.config.slotUnitId ?? "");

  if (!publisherId || !slotUnitId) return null;

  return (
    <AdSlotClient
      placement={placement}
      publisherId={publisherId}
      slotUnitId={slotUnitId}
    />
  );
}
