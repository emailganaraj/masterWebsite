"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export type AuthorInput = {
  name: string;
  slug?: string;
  bio?: string;
  userId?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  socialLinks?: Record<string, string>;
};

export async function listAuthors() {
  return db.select().from(authors).orderBy(authors.name);
}

export async function createAuthor(input: AuthorInput): Promise<ActionResult<{ id: string }>> {
  const perm = await requirePermission("author", "create");
  if (!perm.ok) return perm;

  const slug = input.slug?.trim() || slugify(input.name);
  if (!slug) return fail("Slug is required");

  try {
    const [row] = await db
      .insert(authors)
      .values({
        name: input.name.trim(),
        slug,
        bio: input.bio?.trim() || null,
        userId: input.userId || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        socialLinks: input.socialLinks ?? {},
      })
      .returning();

    revalidatePath("/admin/authors");
    return ok({ id: row.id });
  } catch {
    return fail("Could not create author. Slug may already exist.");
  }
}

export async function updateAuthor(id: string, input: AuthorInput): Promise<ActionResult> {
  const perm = await requirePermission("author", "update");
  if (!perm.ok) return perm;

  const slug = input.slug?.trim() || slugify(input.name);

  try {
    await db
      .update(authors)
      .set({
        name: input.name.trim(),
        slug,
        bio: input.bio?.trim() || null,
        userId: input.userId || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        socialLinks: input.socialLinks ?? {},
        updatedAt: new Date(),
      })
      .where(eq(authors.id, id));

    revalidatePath("/admin/authors");
    return ok(undefined);
  } catch {
    return fail("Could not update author.");
  }
}

export async function deleteAuthor(id: string): Promise<ActionResult> {
  const perm = await requirePermission("author", "delete");
  if (!perm.ok) return perm;

  try {
    await db.delete(authors).where(eq(authors.id, id));
    revalidatePath("/admin/authors");
    return ok(undefined);
  } catch {
    return fail("Could not delete author. Articles may reference this author.");
  }
}
