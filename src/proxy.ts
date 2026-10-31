import { NextRequest, NextResponse } from "next/server";
import { createSiteLockToken, SITE_LOCK_COOKIE } from "./lib/siteLock";

const PUBLIC_PATHS = new Set([
  "/locked",
  "/api/unlock",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith("/_next/");
}

export async function proxy(request: NextRequest) {
  // Phase 0: deny legacy server-file/code endpoints even if site lock is disabled.
  const blockedRoutes = new Set(["/api/run", "/api/local/sync", "/api/local/slots", "/api/local/slots/read", "/api/upload"]);
  if (blockedRoutes.has(request.nextUrl.pathname)) {
    const status = request.nextUrl.pathname === "/api/run" ? 403 : 410;
    return NextResponse.json({ error: "Disabled in Shiorivia Cloud (Phase 0)" }, { status });
  }
  if (process.env.SITE_LOCK_ENABLED !== "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.SITE_LOCK_PASSWORD || "";
  const secret = process.env.SITE_LOCK_SECRET || "";

  if (!password || !secret) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Shiorivia Cloud is locked and the site lock is not configured." },
        { status: 503 },
      );
    }

    const lockedUrl = request.nextUrl.clone();
    lockedUrl.pathname = "/locked";
    lockedUrl.search = "";
    return NextResponse.redirect(lockedUrl);
  }

  const expectedToken = await createSiteLockToken(password, secret);
  const cookieToken = request.cookies.get(SITE_LOCK_COOKIE)?.value;

  if (cookieToken === expectedToken) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Shiorivia Cloud is locked." }, { status: 401 });
  }

  const lockedUrl = request.nextUrl.clone();
  lockedUrl.pathname = "/locked";
  lockedUrl.search = "";
  return NextResponse.redirect(lockedUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
