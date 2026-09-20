"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
};

export async function listCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  const perm = await requirePermission("category", "create");
  if (!perm.ok) return perm;

  const slug = input.slug?.trim() || slugify(input.name);
  if (!slug) return fail("Slug is required");

  try {
    const [row] = await db
      .insert(categories)
      .values({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        parentId: input.parentId || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning();

    revalidatePath("/admin/categories");
    return ok({ id: row.id });
  } catch {
    return fail("Could not create category. Slug may already exist.");
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  const perm = await requirePermission("category", "update");
  if (!perm.ok) return perm;

  const slug = input.slug?.trim() || slugify(input.name);

  try {
    await db
      .update(categories)
      .set({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        parentId: input.parentId || null,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        sortOrder: input.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    return ok(undefined);
  } catch {
    return fail("Could not update category.");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const perm = await requirePermission("category", "delete");
  if (!perm.ok) return perm;

  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/categories");
    return ok(undefined);
  } catch {
    return fail("Could not delete category. It may have child categories or articles.");
  }
}
