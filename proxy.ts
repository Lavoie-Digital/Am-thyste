import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 renamed `middleware` to `proxy`. This runs as an OPTIMISTIC gate
 * only — it never decodes/verifies the session cookie (no admin private key in
 * the edge/CDN path). Real role enforcement lives in the server DAL
 * (lib/auth/dal.ts) at the page/layout/action level.
 *
 * It deliberately does NOT seed the locale cookie any more. Doing so attached a
 * `Set-Cookie` to every cookie-less request — i.e. to every single Googlebot
 * fetch — which forces a per-visitor, uncacheable response and burns crawl
 * budget on a site that has pages still sitting in "Discovered – currently not
 * indexed". `getLocale()` already falls back to `defaultLocale` when the cookie
 * is missing, and `setLocale()` writes it when the visitor actually picks a
 * language, so nothing else depended on this.
 */
const GUARDED_PREFIXES = ["/admin", "/tableau-de-bord", "/pro/espace", "/pro/boutique"];

export function proxy(request: NextRequest) {
  // Optimistic redirect: no session cookie at all → bounce protected routes to login.
  const hasSession = Boolean(request.cookies.get("session")?.value);
  const path = request.nextUrl.pathname;
  if (!hasSession && GUARDED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = new URL("/pro/connexion", request.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Keep crawler-facing static files (fonts, images, robots/sitemap/manifest)
  // out of the proxy entirely so they are served straight from the CDN.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:jpe?g|png|svg|ico|webp|avif|woff2?)$).*)",
  ],
};
