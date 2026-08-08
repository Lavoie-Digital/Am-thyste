import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL, isCanonicalHost } from "@/lib/seo/site";

/**
 * robots.txt. The `sitemap`/`host` values MUST be on the same origin the file is
 * served from — Google discards a sitemap reference pointing at another domain.
 * Both derive from SITE_URL so they can never drift apart.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  // Any host other than the canonical one serves duplicate content and must
  // not be crawled at all. Matches the noindex guard in app/layout.tsx; both
  // sit behind the 301 in proxy.ts.
  if (!isCanonicalHost((await headers()).get("host"))) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / transactional / authenticated areas — no SEO value, keep out.
      disallow: [
        "/api/",
        "/admin",
        "/tableau-de-bord",
        "/checkout",
        "/pro",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
