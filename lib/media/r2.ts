import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getR2PublicUrl, isR2Configured } from "./config";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured");
  }
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }),
  );
}

export function getPublicMediaUrl(key: string): string {
  const base = getR2PublicUrl();
  if (base) return `${base}/${key}`;
  return `/api/media/local/${key}`;
}
