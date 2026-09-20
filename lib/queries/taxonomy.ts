import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { authors, categories, tags } from "@/lib/db/schema";

export async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getTagBySlug(slug: string) {
  const [row] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return row ?? null;
}

export async function getAuthorBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function listCategoriesForNav() {
  return db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .limit(8);
}

export async function listAllCategorySlugs() {
  return db.select({ slug: categories.slug }).from(categories);
}

export async function listAllTagSlugs() {
  return db.select({ slug: tags.slug }).from(tags);
}

export async function listAllAuthorSlugs() {
  return db.select({ slug: authors.slug }).from(authors);
}
