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

/** Host portion of SITE_URL, e.g. `amethystehairproductscanada.ca`. */
export const CANONICAL_HOST = new URL(SITE_URL).host;

/**
 * True when a request arrived on the canonical production host.
 *
 * Any other public host — the retired amethystehairproducts.com domain, a
 * `www.` variant, a preview backend — serves byte-identical HTML. Google
 * clusters those URLs with the canonical one and picks a single winner; a
 * `rel="canonical"` tag is only a hint it is free to overrule (it did, in
 * favour of the old .com). So non-canonical hosts get a 301 in `proxy.ts`
 * and, should one ever slip past it, `noindex` in the root layout.
 *
 * Port and letter case are ignored; a missing host counts as non-canonical.
 */
export function isCanonicalHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return host.split(":")[0].toLowerCase() === CANONICAL_HOST;
}

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
  email: "info@amethystehairproductscanada.ca",
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
