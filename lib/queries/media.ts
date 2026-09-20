import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { resolveMediaUrl } from "@/lib/media/storage";

export async function getMediaById(id: string | null | undefined) {
  if (!id) return null;
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!row) return null;
  return {
    ...row,
    url: resolveMediaUrl(row.originalKey),
    ogUrl: row.variants?.og?.key
      ? resolveMediaUrl(row.variants.og.key)
      : resolveMediaUrl(row.originalKey),
  };
}
