import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale } from "@/lib/i18n/config";
import { SITE_URL, isCanonicalHost } from "@/lib/seo/site";

/**
 * Next.js 16 renamed `middleware` to `proxy`. This runs as an OPTIMISTIC gate
 * only — it never decodes/verifies the session cookie (no admin private key in
 * the edge/CDN path). Real role enforcement lives in the server DAL
 * (lib/auth/dal.ts) at the page/layout/action level.
 */
const GUARDED_PREFIXES = ["/admin", "/tableau-de-bord", "/pro/espace", "/pro/boutique"];

/**
 * Hosts that must be served as-is rather than redirected to the canonical one.
 * Comma-separated, e.g. `ALLOWED_HOSTS=staging.exemple.ca`. Also the kill
 * switch if a platform probe ever trips on the 301.
 */
const ALLOWED_HOSTS = new Set(
  (process.env.ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Container-internal callers that must never be redirected: local development
 * and the platform's own health probes, which reach the container on
 * `localhost:PORT`, a bare hostname or a raw IP rather than a real domain.
 */
function isInternalHost(name: string): boolean {
  return (
    name === "localhost" ||
    name.endsWith(".localhost") ||
    !name.includes(".") ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(name) ||
    name.startsWith("[")
  );
}

export function proxy(request: NextRequest) {
  // 0. Canonicalize the host, before anything else — no point setting cookies
  //    on a response that is leaving this origin. Every alias serves identical
  //    HTML, so without a 301 Google treats them as duplicates and picks the
  //    canonical itself. A `rel="canonical"` tag alone does not settle it.
  const host = request.headers.get("host");
  const name = (host ?? "").split(":")[0].toLowerCase();
  if (
    process.env.NODE_ENV === "production" &&
    host &&
    !isCanonicalHost(host) &&
    !isInternalHost(name) &&
    !ALLOWED_HOSTS.has(name)
  ) {
    const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, SITE_URL);
    return NextResponse.redirect(target, 301);
  }

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
