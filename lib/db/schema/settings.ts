import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { adSlotTypeEnum, homepageSectionTypeEnum } from "./enums";

export const siteSettings = pgTable(
  "site_settings",
  {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const adSlots = pgTable(
  "ad_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placement: text("placement").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    type: adSlotTypeEnum("type").notNull().default("adsense"),
    config: jsonb("config").$type<Record<string, unknown>>(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("ad_slots_placement_idx").on(table.placement)],
);

export const homepageSections = pgTable(
  "homepage_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: homepageSectionTypeEnum("type").notNull(),
    title: text("title"),
    config: jsonb("config").$type<Record<string, unknown>>(),
    sortOrder: integer("sort_order").notNull().default(0),
    enabled: boolean("enabled").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);
