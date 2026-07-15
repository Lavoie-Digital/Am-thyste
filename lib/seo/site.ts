import type { Locale } from "../types";

/**
 * Single source of truth for site-wide SEO/GEO/AEO metadata.
 * Kept free of `server-only` so it can be imported by metadata routes,
 * server components, and JSON-LD builders alike.
 */

export const SITE_URL = "https://www.amethystehairproducts.com";

export const BRAND = {
  name: "Améthyste",
  legalName: "Améthyste Hair Products",
  slogan: {
    fr: "Ce n'est pas simplement un soin, c'est un rituel.",
    en: "It's not just a treatment, it's a ritual.",
  },
  description: {
    fr: "Améthyste — Hair Botox et soins capillaires professionnels haut de gamme, conçus et fabriqués au Québec. Réparation intense, brillance miroir et nutrition profonde à la kératine et à l'extrait de bambou.",
    en: "Améthyste — premium professional Hair Botox and hair care, designed and made in Québec. Intense repair, mirror shine and deep nourishment with keratin and bamboo extract.",
  },
  telephone: "+1-514-691-1899",
  email: "info@amethystehairproducts.com",
  logo: `${SITE_URL}/logo.jpeg`,
  address: {
    locality: "Rimouski",
    region: "QC",
    country: "CA",
  },
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
