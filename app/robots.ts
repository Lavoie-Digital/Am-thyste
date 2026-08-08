import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * robots.txt. The `sitemap`/`host` values MUST be on the same origin the file is
 * served from — Google discards a sitemap reference pointing at another domain.
 * Both derive from SITE_URL so they can never drift apart.
 */
export default function robots(): MetadataRoute.Robots {
  // Preview deployments must not be crawled at all: they would duplicate the
  // canonical domain. Matches the noindex guard in app/layout.tsx.
  const isPreview =
    process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development";

  if (isPreview) {
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
