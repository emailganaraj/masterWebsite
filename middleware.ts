import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

async function resolvePublicRedirect(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return null;
  }

  try {
    const lookupUrl = new URL("/api/redirects/lookup", request.url);
    lookupUrl.searchParams.set("path", pathname);
    const res = await fetch(lookupUrl.toString(), { cache: "no-store" });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      found?: boolean;
      toPath?: string;
      statusCode?: number;
    };

    if (!data.found || !data.toPath) return null;

    const destination = new URL(data.toPath, request.url);
    return NextResponse.redirect(destination, data.statusCode ?? 301);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRedirect = await resolvePublicRedirect(request);
  if (publicRedirect) return publicRedirect;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
