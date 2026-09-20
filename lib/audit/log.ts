import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "login"
  | "logout"
  | "role_change"
  | "settings_change";

export async function logAudit(input: {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata ?? {},
      ipAddress: input.ipAddress ?? null,
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
