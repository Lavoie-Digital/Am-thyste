import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { getProducts } from "@/lib/data/products";

/**
 * Full storefront sitemap. Static marketing/legal routes plus every active
 * product. Authenticated and transactional routes are intentionally excluded
 * (see robots.ts). One URL serves both locales (cookie-based i18n), so no
 * per-language alternates are emitted.
 *
 * Every <loc> is built from SITE_URL, the same constant that feeds
 * `metadataBase`/canonicals — a sitemap listing a different host than the one
 * serving it is rejected wholesale by Search Console.
 */

// The catalogue lives in Firestore, so the sitemap must not be frozen at build
// time or newly published products would never be submitted to Google.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/boutique", priority: 0.9, changeFrequency: "weekly" },
    { path: "/formation", priority: 0.7, changeFrequency: "monthly" },
    { path: "/entretien", priority: 0.7, changeFrequency: "monthly" },
    { path: "/a-propos", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
    { path: "/conditions", priority: 0.2, changeFrequency: "yearly" },
    { path: "/confidentialite", priority: 0.2, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Public catalogue (no viewer → market prices only, all active products).
  // Note: no <image:image> entries — Firebase Storage URLs carry an unescaped
  // "&" (?alt=media&token=…) that Next's sitemap serializer does not XML-escape,
  // which breaks parsing. Product images are already exposed via Product JSON-LD.
  const products = await getProducts(null);
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/boutique/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
