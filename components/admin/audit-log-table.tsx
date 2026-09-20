import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogRow } from "@/lib/queries/audit";

export function AuditLogTable({
  rows,
  total,
}: {
  rows: AuditLogRow[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity ({total.toLocaleString()} total)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="pb-2 pr-4 font-medium">Time</th>
              <th className="pb-2 pr-4 font-medium">User</th>
              <th className="pb-2 pr-4 font-medium">Action</th>
              <th className="pb-2 pr-4 font-medium">Entity</th>
              <th className="pb-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400">
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-100">
                  <td className="py-2 pr-4 whitespace-nowrap text-zinc-600">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="py-2 pr-4">
                    {row.userName ?? row.userEmail ?? (
                      <span className="text-zinc-400">system</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase">
                      {row.action}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-zinc-600">
                    {row.entityType}
                    {row.entityId ? (
                      <span className="block text-xs text-zinc-400 truncate max-w-[120px]">
                        {row.entityId}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 text-zinc-600">
                    {row.metadata ? (
                      <code className="text-xs break-all">
                        {JSON.stringify(row.metadata)}
                      </code>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
