import {
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { articles } from "./content";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: text("session_id").notNull(),
    articleId: uuid("article_id").references(() => articles.id, {
      onDelete: "set null",
    }),
    path: text("path").notNull(),
    referrer: text("referrer"),
    device: text("device"),
    country: text("country"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_events_occurred_at_idx").on(
      table.occurredAt,
      table.articleId,
    ),
    index("analytics_events_session_id_idx").on(table.sessionId),
  ],
);

export const analyticsDailyRollups = pgTable(
  "analytics_daily_rollups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    articleId: uuid("article_id").references(() => articles.id, {
      onDelete: "set null",
    }),
    path: text("path"),
    metric: text("metric").notNull(),
    value: integer("value").notNull().default(0),
  },
  (table) => [
    index("analytics_rollups_date_idx").on(table.date, table.metric),
    index("analytics_rollups_article_idx").on(table.articleId, table.date),
  ],
);

export const articleStats = pgTable("article_stats", {
  articleId: uuid("article_id")
    .primaryKey()
    .references(() => articles.id, { onDelete: "cascade" }),
  viewsTotal: integer("views_total").notNull().default(0),
  views7d: integer("views_7d").notNull().default(0),
  views24h: integer("views_24h").notNull().default(0),
  views2h: integer("views_2h").notNull().default(0),
  trendingScore: doublePrecision("trending_score").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
