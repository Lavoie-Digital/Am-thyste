import type { Locale, ProductDTO } from "../types";
import { pick } from "../utils";
import { SITE_URL, BRAND, absoluteUrl } from "./site";

/**
 * Schema.org JSON-LD builders. These power rich results in classic search
 * (SEO) and give answer/generative engines (AEO/GEO) machine-readable facts
 * about the brand, catalogue and FAQs. Every builder returns a plain object
 * rendered via <JsonLd>.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** The brand as a local beauty business — the anchor node everything links to. */
export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "HealthAndBeautyBusiness"],
    "@id": ORG_ID,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: BRAND.logo,
    image: BRAND.logo,
    description: BRAND.description[locale],
    slogan: BRAND.slogan[locale],
    telephone: BRAND.telephone,
    email: BRAND.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: BRAND.address.locality,
      addressRegion: BRAND.address.region,
      addressCountry: BRAND.address.country,
    },
    areaServed: { "@type": "Country", name: "Canada" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BRAND.telephone,
      contactType: "customer service",
      availableLanguage: ["fr-CA", "en-CA"],
    },
    sameAs: BRAND.sameAs,
  };
}

/** The site itself — helps engines understand structure and language. */
export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: BRAND.name,
    description: BRAND.description[locale],
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    publisher: { "@id": ORG_ID },
  };
}

/** A single product with its offer — drives product rich results. */
export function productJsonLd(product: ProductDTO, locale: Locale) {
  const url = absoluteUrl(`/boutique/${product.slug}`);
  const images = product.images
    .map((src) => (src.startsWith("http") ? src : absoluteUrl(src)))
    .slice(0, 4);
  const price = (product.marketPrice / 100).toFixed(2);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: pick(product.name, locale),
    description: pick(product.shortDesc, locale) || pick(product.description, locale),
    image: images,
    sku: product.slug,
    category: product.category,
    brand: { "@type": "Brand", name: BRAND.name },
    ...(product.ingredients
      ? { material: pick(product.ingredients, locale) }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "CAD",
      price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "CAD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "CA" },
      },
    },
  };
}

/** Breadcrumb trail — earns the breadcrumb line in search results. */
export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A catalogue listing — helps engines enumerate the shop. */
export function itemListJsonLd(products: ProductDTO[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: locale === "fr" ? "Boutique Améthyste" : "Améthyste shop",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: pick(p.name, locale),
      url: absoluteUrl(`/boutique/${p.slug}`),
    })),
  };
}

/** FAQ — the single biggest answer-engine (AEO) lever. Content MUST also be
 *  visible on the page, so this is fed the same Q/A the UI renders. */
export function faqJsonLd(entries: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.q,
      acceptedAnswer: { "@type": "Answer", text: e.a },
    })),
  };
}
