export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

export function getR2PublicUrl(): string {
  return (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
}

export const IMAGE_VARIANTS = [
  { name: "thumb", width: 400 },
  { name: "medium", width: 800 },
  { name: "large", width: 1200 },
  { name: "og", width: 1200, height: 630, fit: "cover" as const },
] as const;

export const LOCAL_MEDIA_DIR =
  process.env.LOCAL_MEDIA_DIR ?? "./data/media";
