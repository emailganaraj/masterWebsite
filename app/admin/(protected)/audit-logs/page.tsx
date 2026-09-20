import { AuditLogTable } from "@/components/admin/audit-log-table";
import { PageHeader } from "@/components/admin/page-header";
import { requirePermission } from "@/lib/auth/require-permission";
import { listAuditLogs } from "@/lib/queries/audit";
import { redirect } from "next/navigation";

export default async function AuditLogsPage() {
  const perm = await requirePermission("audit", "read");
  if (!perm.ok) redirect("/admin");

  const { rows, total } = await listAuditLogs({ limit: 100 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Publish, delete, settings changes, and scheduled publish events."
      />
      <AuditLogTable rows={rows} total={total} />
    </div>
  );
}
