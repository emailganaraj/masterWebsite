import { SlotManager } from "@/components/adsense/slot-manager";
import { PageHeader } from "@/components/admin/page-header";
import {
  getAdSenseSettings,
  listAdSlotsForAdmin,
} from "@/lib/actions/adsense";
import { redirect } from "next/navigation";
import { getServerSession, hasPermission } from "@/lib/auth/server";

export default async function AdSensePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/admin/login");

  const canRead = await hasPermission(session.user.id, "adsense", "read");
  if (!canRead) redirect("/admin");

  const [slots, settings] = await Promise.all([
    listAdSlotsForAdmin(),
    getAdSenseSettings(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AdSense"
        description="Configure ad placements and publisher ID."
      />
      <SlotManager slots={slots} settings={settings} />
    </div>
  );
}
