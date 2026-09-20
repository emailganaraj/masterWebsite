import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
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

export type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
  userEmail: string | null;
  userName: string | null;
};

export async function listAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
  entityType?: string;
  from?: Date;
  to?: Date;
}): Promise<{ rows: AuditLogRow[]; total: number }> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const conditions = [];

  if (options?.action) {
    conditions.push(eq(auditLogs.action, options.action as AuditAction));
  }
  if (options?.entityType) {
    conditions.push(eq(auditLogs.entityType, options.entityType));
  }
  if (options?.from) {
    conditions.push(gte(auditLogs.createdAt, options.from));
  }
  if (options?.to) {
    conditions.push(lte(auditLogs.createdAt, options.to));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(where);

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      metadata: auditLogs.metadata,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    rows: rows.map((r) => ({
      ...r,
      metadata: r.metadata ?? null,
    })),
    total: countRow?.total ?? 0,
  };
}
