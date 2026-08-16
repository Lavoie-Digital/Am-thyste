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
      //
      // The old blanket `Disallow: /pro` also swallowed the public partner
      // landing page, which is linked from the footer — that is what Search
      // Console reported as "Blocked by robots.txt". Only the two logged-in
      // areas are blocked now.
      //
      // /pro/connexion, /pro/inscription and /pro/mot-de-passe-oublie stay
      // crawlable on purpose: they are linked from the navbar, and a URL that
      // is both linked and robots-blocked can still be indexed URL-only,
      // because Google never gets to read the page's `noindex`. Letting it
      // fetch them is what makes the noindex tag effective.
      disallow: [
        "/api/",
        "/admin",
        "/tableau-de-bord",
        "/checkout",
        "/pro/espace",
        "/pro/boutique",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
