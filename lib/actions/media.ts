"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-permission";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import {
  buildMediaKey,
  removeFile,
  resolveMediaUrl,
  storeFile,
} from "@/lib/media/storage";
import {
  isAllowedImageMime,
  processImageVariants,
} from "@/lib/media/process";

export type MediaListItem = {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

export async function listMedia(limit = 50): Promise<MediaListItem[]> {
  const rows = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    url: resolveMediaUrl(row.originalKey),
    altText: row.altText,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt,
  }));
}

export async function uploadMedia(formData: FormData): Promise<ActionResult<MediaListItem>> {
  const perm = await requirePermission("media", "create");
  if (!perm.ok) return perm;

  const file = formData.get("file");
  if (!(file instanceof File)) return fail("No file provided");

  if (!isAllowedImageMime(file.type)) {
    return fail("Unsupported file type. Use JPEG, PNG, WebP, GIF, or AVIF.");
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) return fail("File exceeds 10 MB limit.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const altText = String(formData.get("altText") ?? "").trim() || null;

  try {
    const { original, variants } = await processImageVariants(buffer);
    const baseKey = buildMediaKey(file.name);
    const dir = baseKey.substring(0, baseKey.lastIndexOf("/"));

    const originalKey = `${dir}/original.webp`;
    const sharp = (await import("sharp")).default;
    const originalWebp = await sharp(buffer).rotate().webp({ quality: 90 }).toBuffer();

    await storeFile(originalKey, originalWebp, "image/webp");

    const variantRecords: Record<
      string,
      { key: string; width: number; height: number; format: string }
    > = {};

    for (const variant of variants) {
      const key = `${dir}/${variant.name}.webp`;
      await storeFile(key, variant.buffer, "image/webp");
      variantRecords[variant.name] = {
        key,
        width: variant.width,
        height: variant.height,
        format: variant.format,
      };
    }

    const [row] = await db
      .insert(media)
      .values({
        filename: file.name,
        originalKey,
        variants: variantRecords,
        altText,
        mimeType: "image/webp",
        width: original.width ?? null,
        height: original.height ?? null,
        fileSize: file.size,
        uploadedBy: perm.data.userId,
      })
      .returning();

    revalidatePath("/admin/media");

    return ok({
      id: row.id,
      filename: row.filename,
      url: resolveMediaUrl(row.originalKey),
      altText: row.altText,
      mimeType: row.mimeType,
      width: row.width,
      height: row.height,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return fail("Upload failed. Check server logs.");
  }
}

export async function updateMediaMeta(
  id: string,
  data: { altText?: string; caption?: string; attribution?: string },
): Promise<ActionResult> {
  const perm = await requirePermission("media", "update");
  if (!perm.ok) return perm;

  await db
    .update(media)
    .set({
      altText: data.altText?.trim() || null,
      caption: data.caption?.trim() || null,
      attribution: data.attribution?.trim() || null,
    })
    .where(eq(media.id, id));

  revalidatePath("/admin/media");
  return ok(undefined);
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const perm = await requirePermission("media", "delete");
  if (!perm.ok) return perm;

  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!row) return fail("Media not found");

  try {
    await removeFile(row.originalKey);
    if (row.variants) {
      for (const variant of Object.values(row.variants)) {
        await removeFile(variant.key);
      }
    }
    await db.delete(media).where(eq(media.id, id));
    revalidatePath("/admin/media");
    return ok(undefined);
  } catch {
    return fail("Could not delete media.");
  }
}

export async function getMediaUrl(mediaId: string): Promise<string | null> {
  const [row] = await db
    .select({ originalKey: media.originalKey })
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1);
  return row ? resolveMediaUrl(row.originalKey) : null;
}
