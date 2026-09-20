import {
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});
import { articleStatusEnum, pageStatusEnum } from "./enums";
import { users } from "./auth";

export const authors = pgTable(
  "authors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    bio: text("bio"),
    avatarMediaId: uuid("avatar_media_id"),
    socialLinks: jsonb("social_links").$type<Record<string, string>>(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("authors_slug_idx").on(table.slug),
    index("authors_user_id_idx").on(table.userId),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageMediaId: uuid("image_media_id"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_parent_id_idx").on(table.parentId),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)],
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    excerpt: text("excerpt"),
    /** TipTap ProseMirror JSON document */
    body: jsonb("body").$type<Record<string, unknown>>(),
    /** Plain text extracted from body for search indexing */
    bodyText: text("body_text"),
    /** PostgreSQL full-text search vector — updated on save */
    searchVector: tsvector("search_vector"),
    status: articleStatusEnum("status").notNull().default("draft"),
    authorId: uuid("author_id").references(() => authors.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    featuredMediaId: uuid("featured_media_id"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    ogImageMediaId: uuid("og_image_media_id"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedContentAt: timestamp("updated_content_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("articles_slug_idx").on(table.slug),
    index("articles_status_published_idx").on(table.status, table.publishedAt),
    index("articles_category_idx").on(
      table.categoryId,
      table.status,
      table.publishedAt,
    ),
    index("articles_author_idx").on(table.authorId),
    index("articles_scheduled_idx").on(table.status, table.scheduledAt),
  ],
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.tagId] }),
    index("article_tags_article_id_idx").on(table.articleId),
    index("article_tags_tag_id_idx").on(table.tagId),
  ],
);

export const articleRevisions = pgTable(
  "article_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    editorId: text("editor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    changeSummary: text("change_summary"),
    aiMetadata: jsonb("ai_metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("article_revisions_article_id_idx").on(table.articleId),
    uniqueIndex("article_revisions_article_version_idx").on(
      table.articleId,
      table.version,
    ),
  ],
);

export const articleRelations = pgTable(
  "article_relations",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    relatedArticleId: uuid("related_article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.relatedArticleId] }),
    index("article_relations_article_id_idx").on(table.articleId),
  ],
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: jsonb("body").$type<Record<string, unknown>>(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    status: pageStatusEnum("status").notNull().default("draft"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("pages_slug_idx").on(table.slug)],
);

export const redirects = pgTable(
  "redirects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromPath: text("from_path").notNull(),
    toPath: text("to_path").notNull(),
    statusCode: integer("status_code").notNull().default(301),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("redirects_from_path_idx").on(table.fromPath)],
);
