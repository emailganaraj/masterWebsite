import { NextRequest, NextResponse } from "next/server";
import { lookupRedirect } from "@/lib/queries/redirects";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const redirect = await lookupRedirect(path);
  if (!redirect) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    toPath: redirect.toPath,
    statusCode: redirect.statusCode,
  });
}
