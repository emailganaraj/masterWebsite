"use server";

import { and, desc, eq, ilike, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { getUserRoles, hasPermission } from "@/lib/auth/server";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { getClientIp } from "@/lib/audit/client-ip";
import { logAudit } from "@/lib/audit/log";
import { createArticleRevision } from "@/lib/articles/revisions";
import { publishDueScheduledArticles, updateSearchVector } from "@/lib/articles/scheduled";
import { upsertArticleSlugRedirect } from "@/lib/redirects/upsert";
import { emptyTipTapDocument, extractTextFromBody } from "@/lib/tiptap/extract-text";
import { db } from "@/lib/db";
import {
  articleRevisions,
  articleTags,
  articles,
  authors,
  categories,
} from "@/lib/db/schema";
import { revalidatePublishedArticle } from "@/lib/seo/revalidate-public";
import { slugify } from "@/lib/utils";

export type ArticleStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export type ArticleInput = {
  title: string;
  slug?: string;
  subtitle?: string;
  excerpt?: string;
  body?: Record<string, unknown>;
  status?: ArticleStatus;
  authorId?: string | null;
  categoryId?: string | null;
  tagIds?: string[];
  featuredMediaId?: string | null;
  ogImageMediaId?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  scheduledAt?: string | null;
  changeSummary?: string;
};

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug;
  let counter = 2;

  while (true) {
    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(
        excludeId
          ? and(eq(articles.slug, candidate), ne(articles.id, excludeId))
          : eq(articles.slug, candidate),
      )
      .limit(1);

    if (!existing) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

async function canEditArticle(userId: string, articleId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  if (roles.includes("SUPER_ADMIN") || roles.includes("EDITOR")) return true;

  const [author] = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.userId, userId))
    .limit(1);

  if (!author) return false;

  const [article] = await db
    .select({ authorId: articles.authorId })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  return article?.authorId === author.id;
}

async function revalidateArticlePublic(
  slug: string,
  categoryId: string | null | undefined,
) {
  let categorySlug: string | null = null;
  if (categoryId) {
    const [cat] = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    categorySlug = cat?.slug ?? null;
  }
  revalidatePublishedArticle(slug, categorySlug);
}

async function syncArticleTags(articleId: string, tagIds: string[]) {
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  if (tagIds.length === 0) return;

  await db.insert(articleTags).values(
    tagIds.map((tagId) => ({ articleId, tagId })),
  );
}

function resolvePublishFields(
  status: ArticleStatus,
  scheduledAt: Date | null,
  existingPublishedAt: Date | null,
) {
  const now = new Date();

  if (status === "published") {
    return {
      publishedAt: existingPublishedAt ?? now,
      scheduledAt: null as Date | null,
      updatedContentAt: now,
    };
  }

  if (status === "scheduled" && scheduledAt) {
    return {
      publishedAt: null as Date | null,
      scheduledAt,
      updatedContentAt: now,
    };
  }

  return {
    publishedAt: existingPublishedAt,
    scheduledAt: status === "scheduled" ? scheduledAt : null,
    updatedContentAt: now,
  };
}

export async function listArticles(options?: {
  status?: ArticleStatus;
  search?: string;
}) {
  await publishDueScheduledArticles();

  const conditions = [];

  if (options?.status) {
    conditions.push(eq(articles.status, options.status));
  }

  if (options?.search?.trim()) {
    const q = `%${options.search.trim()}%`;
    conditions.push(
      or(
        ilike(articles.title, q),
        ilike(articles.slug, q),
        ilike(articles.excerpt, q),
      )!,
    );
  }

  return db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      publishedAt: articles.publishedAt,
      scheduledAt: articles.scheduledAt,
      updatedAt: articles.updatedAt,
      authorId: articles.authorId,
      categoryId: articles.categoryId,
    })
    .from(articles)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(articles.updatedAt))
    .limit(100);
}

export async function getArticleById(id: string) {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!article) return null;

  const tags = await db
    .select({ tagId: articleTags.tagId })
    .from(articleTags)
    .where(eq(articleTags.articleId, id));

  return { ...article, tagIds: tags.map((t) => t.tagId) };
}

export async function createArticle(input: ArticleInput): Promise<ActionResult<{ id: string }>> {
  const perm = await requirePermission("article", "create");
  if (!perm.ok) return perm;

  const title = input.title.trim();
  if (!title) return fail("Title is required");

  const slug = await ensureUniqueSlug(
    input.slug?.trim() || slugify(title) || "untitled",
  );
  const body = input.body ?? emptyTipTapDocument();
  const bodyText = extractTextFromBody(body);
  const status = input.status ?? "draft";
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const publishFields = resolvePublishFields(status, scheduledAt, null);

  if (status === "published") {
    const canPublish = await hasPermission(perm.data.userId, "article", "publish");
    if (!canPublish) return fail("You cannot publish articles.");
  }

  try {
    const [row] = await db
      .insert(articles)
      .values({
        title,
        slug,
        subtitle: input.subtitle?.trim() || null,
        excerpt: input.excerpt?.trim() || null,
        body,
        bodyText,
        status,
        authorId: input.authorId || null,
        categoryId: input.categoryId || null,
        featuredMediaId: input.featuredMediaId || null,
        ogImageMediaId: input.ogImageMediaId || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        canonicalUrl: input.canonicalUrl?.trim() || null,
        ...publishFields,
        createdBy: perm.data.userId,
        updatedBy: perm.data.userId,
      })
      .returning();

    await syncArticleTags(row.id, input.tagIds ?? []);
    await createArticleRevision(row.id, perm.data.userId, input.changeSummary ?? "Initial version");
    await updateSearchVector(row.id);

    revalidatePath("/admin/articles");
    if (status === "published") {
      await revalidateArticlePublic(slug, input.categoryId);
    }

    const ip = await getClientIp();
    await logAudit({
      userId: perm.data.userId,
      action: status === "published" ? "publish" : "create",
      entityType: "article",
      entityId: row.id,
      metadata: { title, slug, status },
      ipAddress: ip,
    });

    return ok({ id: row.id });
  } catch (err) {
    console.error("Create article failed:", err);
    return fail("Could not create article.");
  }
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
): Promise<ActionResult> {
  const perm = await requirePermission("article", "update");
  if (!perm.ok) return perm;

  const canEdit = await canEditArticle(perm.data.userId, id);
  if (!canEdit) return fail("You can only edit your own articles.");

  const [existing] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!existing) return fail("Article not found");

  const title = input.title.trim();
  if (!title) return fail("Title is required");

  const slug = await ensureUniqueSlug(
    input.slug?.trim() || slugify(title) || existing.slug,
    id,
  );

  const body = input.body ?? (existing.body as Record<string, unknown>) ?? emptyTipTapDocument();
  const bodyText = extractTextFromBody(body);
  const status = input.status ?? existing.status;
  const scheduledAt = input.scheduledAt
    ? new Date(input.scheduledAt)
    : existing.scheduledAt;

  if (status === "published" && existing.status !== "published") {
    const canPublish = await hasPermission(perm.data.userId, "article", "publish");
    if (!canPublish) return fail("You cannot publish articles.");
  }

  const publishFields = resolvePublishFields(
    status,
    scheduledAt,
    existing.publishedAt,
  );

  try {
    await db
      .update(articles)
      .set({
        title,
        slug,
        subtitle: input.subtitle?.trim() || null,
        excerpt: input.excerpt?.trim() || null,
        body,
        bodyText,
        status,
        authorId: input.authorId ?? existing.authorId,
        categoryId: input.categoryId ?? existing.categoryId,
        featuredMediaId: input.featuredMediaId ?? existing.featuredMediaId,
        ogImageMediaId: input.ogImageMediaId ?? existing.ogImageMediaId,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        canonicalUrl: input.canonicalUrl?.trim() || null,
        ...publishFields,
        updatedBy: perm.data.userId,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id));

    await syncArticleTags(id, input.tagIds ?? []);
    await createArticleRevision(id, perm.data.userId, input.changeSummary ?? "Updated");
    await updateSearchVector(id);

    if (
      existing.status === "published" &&
      existing.slug !== slug
    ) {
      await upsertArticleSlugRedirect(existing.slug, slug);
    }

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    if (status === "published" || existing.status === "published") {
      await revalidateArticlePublic(slug, input.categoryId ?? existing.categoryId);
      if (existing.slug !== slug) {
        await revalidateArticlePublic(existing.slug, existing.categoryId);
      }
    }

    const ip = await getClientIp();
    let action: "update" | "publish" | "archive" = "update";
    if (status === "published" && existing.status !== "published") action = "publish";
    else if (status === "archived" && existing.status !== "archived") action = "archive";

    await logAudit({
      userId: perm.data.userId,
      action,
      entityType: "article",
      entityId: id,
      metadata: {
        title,
        slug,
        status,
        previousSlug: existing.slug !== slug ? existing.slug : undefined,
      },
      ipAddress: ip,
    });

    return ok(undefined);
  } catch (err) {
    console.error("Update article failed:", err);
    return fail("Could not update article.");
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const perm = await requirePermission("article", "delete");
  if (!perm.ok) return perm;

  const [existing] = await db
    .select({ slug: articles.slug, status: articles.status, categoryId: articles.categoryId })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  try {
    await db.delete(articles).where(eq(articles.id, id));
    revalidatePath("/admin/articles");
    if (existing?.status === "published") {
      await revalidateArticlePublic(existing.slug, existing.categoryId);
    }

    const ip = await getClientIp();
    await logAudit({
      userId: perm.data.userId,
      action: "delete",
      entityType: "article",
      entityId: id,
      metadata: { slug: existing?.slug },
      ipAddress: ip,
    });

    return ok(undefined);
  } catch {
    return fail("Could not delete article.");
  }
}

export async function duplicateArticle(id: string): Promise<ActionResult<{ id: string }>> {
  const perm = await requirePermission("article", "create");
  if (!perm.ok) return perm;

  const article = await getArticleById(id);
  if (!article) return fail("Article not found");

  const newSlug = await ensureUniqueSlug(`${article.slug}-copy`);

  const [row] = await db
    .insert(articles)
    .values({
      title: `${article.title} (Copy)`,
      slug: newSlug,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      body: article.body,
      bodyText: article.bodyText,
      status: "draft",
      authorId: article.authorId,
      categoryId: article.categoryId,
      featuredMediaId: article.featuredMediaId,
      ogImageMediaId: article.ogImageMediaId,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      canonicalUrl: null,
      createdBy: perm.data.userId,
      updatedBy: perm.data.userId,
    })
    .returning();

  await syncArticleTags(row.id, article.tagIds);
  await createArticleRevision(row.id, perm.data.userId, "Duplicated from original");
  await updateSearchVector(row.id);

  revalidatePath("/admin/articles");
  return ok({ id: row.id });
}

export async function listArticleRevisions(articleId: string) {
  return db
    .select({
      id: articleRevisions.id,
      version: articleRevisions.version,
      changeSummary: articleRevisions.changeSummary,
      editorId: articleRevisions.editorId,
      createdAt: articleRevisions.createdAt,
    })
    .from(articleRevisions)
    .where(eq(articleRevisions.articleId, articleId))
    .orderBy(desc(articleRevisions.version));
}

export async function restoreArticleRevision(
  articleId: string,
  revisionId: string,
): Promise<ActionResult> {
  const perm = await requirePermission("article", "update");
  if (!perm.ok) return perm;

  const canEdit = await canEditArticle(perm.data.userId, articleId);
  if (!canEdit) return fail("You can only edit your own articles.");

  const [revision] = await db
    .select()
    .from(articleRevisions)
    .where(
      and(
        eq(articleRevisions.id, revisionId),
        eq(articleRevisions.articleId, articleId),
      ),
    )
    .limit(1);

  if (!revision) return fail("Revision not found");

  const snapshot = revision.snapshot as Record<string, unknown>;

  await db
    .update(articles)
    .set({
      title: String(snapshot.title ?? ""),
      subtitle: (snapshot.subtitle as string) ?? null,
      excerpt: (snapshot.excerpt as string) ?? null,
      body: (snapshot.body as Record<string, unknown>) ?? emptyTipTapDocument(),
      bodyText: extractTextFromBody(snapshot.body as Record<string, unknown>),
      seoTitle: (snapshot.seoTitle as string) ?? null,
      seoDescription: (snapshot.seoDescription as string) ?? null,
      updatedBy: perm.data.userId,
      updatedAt: new Date(),
      updatedContentAt: new Date(),
    })
    .where(eq(articles.id, articleId));

  await createArticleRevision(
    articleId,
    perm.data.userId,
    `Restored from version ${revision.version}`,
  );
  await updateSearchVector(articleId);

  revalidatePath(`/admin/articles/${articleId}`);
  return ok(undefined);
}
