import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale } from "@/lib/i18n/config";

/**
 * Next.js 16 renamed `middleware` to `proxy`. This runs as an OPTIMISTIC gate
 * only — it never decodes/verifies the session cookie (no admin private key in
 * the edge/CDN path). Real role enforcement lives in the server DAL
 * (lib/auth/dal.ts) at the page/layout/action level.
 */
const GUARDED_PREFIXES = ["/admin", "/tableau-de-bord", "/pro/espace", "/pro/boutique"];

export function proxy(request: NextRequest) {
  const res = NextResponse.next();

  // 1. Ensure a default locale cookie exists.
  if (!request.cookies.get(LOCALE_COOKIE)) {
    res.cookies.set(LOCALE_COOKIE, defaultLocale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  // 2. Optimistic redirect: no session cookie at all → bounce protected routes to login.
  const hasSession = Boolean(request.cookies.get("session")?.value);
  const path = request.nextUrl.pathname;
  if (!hasSession && GUARDED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = new URL("/pro/connexion", request.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpe?g|png|svg|ico|webp)$).*)"],
};
