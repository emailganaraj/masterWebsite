import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditActionEnum } from "./enums";
import { users } from "./auth";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  ],
);
