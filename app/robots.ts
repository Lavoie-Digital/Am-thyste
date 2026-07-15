import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
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
