import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { articles } from "./content";

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: text("filename").notNull(),
    originalKey: text("original_key").notNull(),
    variants: jsonb("variants").$type<
      Record<string, { key: string; width: number; height: number; format: string }>
    >(),
    altText: text("alt_text"),
    caption: text("caption"),
    attribution: text("attribution"),
    mimeType: text("mime_type").notNull(),
    width: integer("width"),
    height: integer("height"),
    fileSize: integer("file_size"),
    uploadedBy: text("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("media_uploaded_by_idx").on(table.uploadedBy)],
);

export const articleMedia = pgTable(
  "article_media",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    caption: text("caption"),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.mediaId] }),
    index("article_media_article_id_idx").on(table.articleId),
  ],
);
