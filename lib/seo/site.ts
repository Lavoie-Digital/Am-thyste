import type { Metadata } from "next";
import type { Locale } from "../types";

/**
 * Single source of truth for site-wide SEO/GEO/AEO metadata.
 * Kept free of `server-only` so it can be imported by metadata routes,
 * server components, and JSON-LD builders alike.
 */

/**
 * The ONE canonical production origin. Everything SEO-facing derives from it:
 * `metadataBase`, every `alternates.canonical`, `og:url`, robots.txt, the
 * sitemap and all JSON-LD `@id`/`url` nodes.
 *
 * Deliberately a hardcoded constant, not an env var: a wrong/missing env value
 * on one deployment would emit canonicals pointing somewhere else and de-index
 * the whole site. No trailing slash — `absoluteUrl()` handles joining.
 */
export const SITE_URL = "https://amethystehairproductscanada.ca";

export const BRAND = {
  name: "Améthyste",
  legalName: "Améthyste Hair Products",
  /**
   * Every spelling people (and engines) use for the brand. Feeds schema.org
   * `alternateName` on Organization + WebSite so Google can match queries like
   * "amethyste hair products canada" (no accent) to this site and pick a proper
   * site name in results. Keep in sync with the Google Business Profile name.
   */
  alternateNames: [
    "Améthyste Hair Products Canada",
    "Amethyste Hair Products Canada",
    "Améthyste Hair Products",
    "Amethyste Hair Products",
    "Amethyste",
  ],
  slogan: {
    fr: "Ce n'est pas simplement un soin, c'est un rituel.",
    en: "It's not just a treatment, it's a ritual.",
  },
  description: {
    fr: "AMÉTHYSTE Hair Products Canada — une marque québécoise spécialisée dans les soins capillaires professionnels. Traitements Hair Botox réservés aux professionnels et produits d'entretien à domicile à la kératine et à l'extrait de bambou.",
    en: "AMÉTHYSTE Hair Products Canada — a Québec brand specialized in professional hair care. Hair Botox treatments reserved for professionals, and at-home care products with keratin and bamboo extract.",
  },
  telephone: "+1-514-691-1899",
  email: "info@amethystehairproductscanada.ca",
  logo: `${SITE_URL}/logo.jpeg`,
  address: {
    locality: "Rimouski",
    region: "QC",
    country: "CA",
  },
  /**
   * Official profiles that confirm the brand's identity (Knowledge Graph / GEO).
   * TODO: add the Google Business Profile share link (https://maps.app.goo.gl/…)
   * and Instagram once they exist. Every profile must point back to SITE_URL.
   */
  sameAs: ["https://www.facebook.com/AmethysteHairProducts"],
  themeColor: "#65338E",
} as const;

/** Locale → BCP-47 / Open Graph locale tag. */
export function ogLocale(locale: Locale): string {
  return locale === "fr" ? "fr_CA" : "en_CA";
}

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Metadata for routes that must never be indexed — sign-in, sign-up, checkout,
 * dashboards. Deliberately emits NO canonical: pairing `noindex` with a
 * canonical sends Google two contradicting instructions, and the root layout no
 * longer supplies one to inherit.
 *
 * `follow` stays on by default so link equity still flows out of these pages to
 * the public storefront; pass `follow: false` for authenticated areas whose
 * links go nowhere useful.
 */
export function noindexMetadata(title: string, follow = true): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow,
      googleBot: { index: false, follow },
    },
  };
}
