import { SeoDashboard } from "@/components/admin/seo-dashboard";
import { PageHeader } from "@/components/admin/page-header";
import { getSeoOverview } from "@/lib/queries/seo-admin";
import { redirect } from "next/navigation";
import { getServerSession, hasPermission } from "@/lib/auth/server";

export default async function SeoPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/admin/login");

  const canRead = await hasPermission(session.user.id, "settings", "read");
  if (!canRead) redirect("/admin");

  const overview = await getSeoOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO"
        description="Sitemap status, default meta, and redirect management."
      />
      <SeoDashboard overview={overview} />
    </div>
  );
}
