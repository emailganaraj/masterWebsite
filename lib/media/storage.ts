import { mkdir, writeFile, unlink, rm } from "fs/promises";
import path from "path";
import { LOCAL_MEDIA_DIR, isR2Configured } from "./config";
import { deleteFromR2, getPublicMediaUrl, uploadToR2 } from "./r2";

export function buildMediaKey(filename: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  return `${year}/${month}/${id}/${safeName}`;
}

export async function storeFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  if (isR2Configured()) {
    await uploadToR2(key, buffer, contentType);
    return;
  }

  const filePath = path.join(LOCAL_MEDIA_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}

export async function removeFile(key: string): Promise<void> {
  if (isR2Configured()) {
    await deleteFromR2(key);
    return;
  }

  const filePath = path.join(LOCAL_MEDIA_DIR, key);
  try {
    await unlink(filePath);
  } catch {
    // file may already be gone
  }
}

export async function removeMediaPrefix(prefix: string): Promise<void> {
  if (isR2Configured()) {
    await deleteFromR2(prefix);
    return;
  }

  const dirPath = path.join(LOCAL_MEDIA_DIR, path.dirname(prefix));
  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

export function resolveMediaUrl(key: string): string {
  if (isR2Configured()) {
    return getPublicMediaUrl(key);
  }
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `/api/media/local/${encoded}`;
}
