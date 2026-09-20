import { and, desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  articleRelations,
  articles,
  articleTags,
  authors,
  categories,
  tags,
} from "@/lib/db/schema";
import { cacheTags } from "@/lib/seo/cache-tags";
import { getMediaById } from "./media";

export type ArticleCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
  author: { name: string; slug: string } | null;
  featuredImageUrl: string | null;
};

const publishedOnly = eq(articles.status, "published");

async function mapArticleCards(
  rows: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    categoryName: string | null;
    categorySlug: string | null;
    authorName: string | null;
    authorSlug: string | null;
    featuredMediaId: string | null;
  }[],
): Promise<ArticleCardData[]> {
  return Promise.all(
    rows.map(async (row) => {
      const media = await getMediaById(row.featuredMediaId);
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        publishedAt: row.publishedAt,
        category:
          row.categorySlug && row.categoryName
            ? { name: row.categoryName, slug: row.categorySlug }
            : null,
        author:
          row.authorSlug && row.authorName
            ? { name: row.authorName, slug: row.authorSlug }
            : null,
        featuredImageUrl: media?.url ?? null,
      };
    }),
  );
}

async function fetchPublishedArticles(limit = 12, categoryId?: string) {
  const conditions = categoryId
    ? and(publishedOnly, eq(articles.categoryId, categoryId))
    : publishedOnly;

  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      publishedAt: articles.publishedAt,
      featuredMediaId: articles.featuredMediaId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.name,
      authorSlug: authors.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .where(conditions)
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return mapArticleCards(rows);
}

export async function listLatestArticles(limit = 12) {
  return fetchPublishedArticles(limit);
}

export async function listArticlesByCategory(categoryId: string, limit = 24) {
  return fetchPublishedArticles(limit, categoryId);
}

export async function listArticlesByTag(tagId: string, limit = 24) {
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      publishedAt: articles.publishedAt,
      featuredMediaId: articles.featuredMediaId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.name,
      authorSlug: authors.slug,
    })
    .from(articles)
    .innerJoin(articleTags, eq(articleTags.articleId, articles.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .where(and(publishedOnly, eq(articleTags.tagId, tagId)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return mapArticleCards(rows);
}

export async function listArticlesByAuthor(authorId: string, limit = 24) {
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      publishedAt: articles.publishedAt,
      featuredMediaId: articles.featuredMediaId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.name,
      authorSlug: authors.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .where(and(publishedOnly, eq(articles.authorId, authorId)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return mapArticleCards(rows);
}

export async function countPublishedArticlesByTag(tagId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .innerJoin(articleTags, eq(articleTags.articleId, articles.id))
    .where(and(publishedOnly, eq(articleTags.tagId, tagId)));

  return row?.count ?? 0;
}

export async function getPublishedArticleBySlug(slug: string) {
  const [row] = await db
    .select({
      article: articles,
      author: authors,
      category: categories,
    })
    .from(articles)
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.slug, slug), publishedOnly))
    .limit(1);

  if (!row) return null;

  const tagRows = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, row.article.id));

  const relatedRows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      publishedAt: articles.publishedAt,
      featuredMediaId: articles.featuredMediaId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: authors.name,
      authorSlug: authors.slug,
    })
    .from(articleRelations)
    .innerJoin(articles, eq(articleRelations.relatedArticleId, articles.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .where(and(eq(articleRelations.articleId, row.article.id), publishedOnly))
    .orderBy(articleRelations.sortOrder)
    .limit(6);

  const featuredMedia = await getMediaById(row.article.featuredMediaId);
  const ogMedia = await getMediaById(row.article.ogImageMediaId ?? row.article.featuredMediaId);

  return {
    ...row.article,
    author: row.author,
    category: row.category,
    tags: tagRows,
    related: await mapArticleCards(relatedRows),
    featuredMedia,
    ogMedia,
  };
}

export function getCachedPublishedArticle(slug: string) {
  return unstable_cache(
    () => getPublishedArticleBySlug(slug),
    [`article-${slug}`],
    { tags: [cacheTags.article(slug)], revalidate: 300 },
  )();
}

export async function listPublishedSlugs() {
  return db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt })
    .from(articles)
    .where(publishedOnly)
    .orderBy(desc(articles.publishedAt));
}
