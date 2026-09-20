import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { LOCAL_MEDIA_DIR } from "@/lib/media/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const key = segments.map(decodeURIComponent).join("/");
  const filePath = path.join(LOCAL_MEDIA_DIR, key);

  if (!filePath.startsWith(path.resolve(LOCAL_MEDIA_DIR))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".webp"
        ? "image/webp"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
