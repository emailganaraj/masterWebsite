import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cacheTags } from "@/lib/seo/cache-tags";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { tags?: string[] };
  const tags = body.tags ?? [];

  if (tags.length === 0) {
    return NextResponse.json({ error: "No tags provided" }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true, tags });
}

/** Convenience GET for manual testing in dev only */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(cacheTags.homepage);
  revalidateTag(cacheTags.sitemap);

  return NextResponse.json({ revalidated: ["homepage", "sitemap"] });
}
