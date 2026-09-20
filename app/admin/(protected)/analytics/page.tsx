import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { PageHeader } from "@/components/admin/page-header";
import { requirePermission } from "@/lib/auth/require-permission";
import {
  getAnalyticsOverview,
  getDeviceBreakdown,
  getRecentEventCount,
  getTopArticles,
  getTopReferrers,
  getTrafficByDay,
} from "@/lib/queries/analytics";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const perm = await requirePermission("analytics", "read");
  if (!perm.ok) redirect("/admin");

  const [overview, traffic, topArticles, referrers, devices, recentEvents] =
    await Promise.all([
      getAnalyticsOverview(7),
      getTrafficByDay(14),
      getTopArticles(10),
      getTopReferrers(8, 7),
      getDeviceBreakdown(7),
      getRecentEventCount(24),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Traffic, top articles, referrers, and device breakdown."
      />
      <AnalyticsDashboard
        overview={overview}
        traffic={traffic}
        topArticles={topArticles}
        referrers={referrers}
        devices={devices}
        recentEvents={recentEvents}
      />
    </div>
  );
}
