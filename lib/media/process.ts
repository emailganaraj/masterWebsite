import sharp, { type Metadata } from "sharp";
import { IMAGE_VARIANTS } from "./config";

export type ProcessedVariant = {
  name: string;
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
};

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function isAllowedImageMime(mimeType: string): boolean {
  return ALLOWED_MIME.has(mimeType);
}

export async function processImageVariants(
  input: Buffer,
): Promise<{ original: Metadata; variants: ProcessedVariant[] }> {
  const image = sharp(input, { animated: false });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  const variants: ProcessedVariant[] = [];

  for (const spec of IMAGE_VARIANTS) {
    let pipeline = sharp(input).rotate();

    if ("height" in spec && spec.height) {
      pipeline = pipeline.resize(spec.width, spec.height, {
        fit: spec.fit ?? "cover",
        withoutEnlargement: true,
      });
    } else {
      pipeline = pipeline.resize(spec.width, undefined, {
        withoutEnlargement: true,
      });
    }

    const buffer = await pipeline.webp({ quality: 82 }).toBuffer();
    const info = await sharp(buffer).metadata();

    variants.push({
      name: spec.name,
      buffer,
      width: info.width ?? spec.width,
      height: info.height ?? metadata.height,
      format: "webp",
    });
  }

  return { original: metadata, variants };
}
