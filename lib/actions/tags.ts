"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export type TagInput = {
  name: string;
  slug?: string;
  description?: string;
};

export async function listTags() {
  return db.select().from(tags).orderBy(tags.name);
}

export async function createTag(input: TagInput): Promise<ActionResult<{ id: string }>> {
  const perm = await requirePermission("tag", "create");
  if (!perm.ok) return perm;

  const slug = input.slug?.trim() || slugify(input.name);
  if (!slug) return fail("Slug is required");

  try {
    const [row] = await db
      .insert(tags)
      .values({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
      })
      .returning();

    revalidatePath("/admin/tags");
    return ok({ id: row.id });
  } catch {
    return fail("Could not create tag. Slug may already exist.");
  }
}

export async function updateTag(id: string, input: TagInput): Promise<ActionResult> {
  const perm = await requirePermission("tag", "update");
  if (!perm.ok) return perm;

  const slug = input.slug?.trim() || slugify(input.name);

  try {
    await db
      .update(tags)
      .set({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
      })
      .where(eq(tags.id, id));

    revalidatePath("/admin/tags");
    return ok(undefined);
  } catch {
    return fail("Could not update tag.");
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const perm = await requirePermission("tag", "delete");
  if (!perm.ok) return perm;

  try {
    await db.delete(tags).where(eq(tags.id, id));
    revalidatePath("/admin/tags");
    return ok(undefined);
  } catch {
    return fail("Could not delete tag.");
  }
}
