import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Cinzel, Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getI18n } from "@/lib/i18n/server";
import { SITE_URL, BRAND, isCanonicalHost } from "@/lib/seo/site";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
  display: "swap",
});

const BASE_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Améthyste — Hair Botox & Soins capillaires professionnels",
    template: "%s · Améthyste",
  },
  description: BRAND.description.fr,
  applicationName: "Améthyste",
  keywords: [
    "hair botox",
    "botox capillaire",
    "soin capillaire professionnel",
    "kératine",
    "masque capillaire",
    "soin lissant",
    "cheveux abîmés",
    "Améthyste",
    "Rimouski",
    "Québec",
  ],
  authors: [{ name: "Améthyste" }],
  creator: "Améthyste",
  publisher: "Améthyste",
  category: "beauty",
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    title: "Améthyste — Hair Botox",
    description:
      "Soins capillaires professionnels haut de gamme, conçus au Québec. Un rituel de transformation à la kératine et à l'extrait de bambou.",
    url: SITE_URL,
    type: "website",
    locale: "fr_CA",
    alternateLocale: "en_CA",
    siteName: "Améthyste",
    images: [{ url: "/logo.jpeg", width: 1980, height: 2048, alt: "Améthyste — Hair Botox" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Améthyste — Hair Botox",
    description:
      "Soins capillaires professionnels haut de gamme, conçus au Québec. Un rituel de transformation.",
    images: ["/logo.jpeg"],
  },
  // Search Console / Bing ownership proof. Set the tokens as env vars on the
  // deployment; when unset the tags are simply omitted (DNS verification works too).
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  appleWebApp: {
    capable: true,
    title: "Améthyste",
    statusBarStyle: "default",
  },
};

/**
 * Indexability is decided per request, from the host.
 *
 * Only the canonical domain may be indexed: every alias (the retired
 * amethystehairproducts.com, a `www.` variant, a preview backend) serves the
 * same HTML and would compete with it in the index — which is exactly how
 * Google came to treat the old .com as the canonical of this site.
 * `proxy.ts` already 301s those hosts; this is the second line of defence for
 * anything allowlisted there.
 *
 * The layout is dynamic regardless — `getI18n()` reads the locale cookie — so
 * reading a header here costs no static rendering.
 */
export async function generateMetadata(): Promise<Metadata> {
  const indexable = isCanonicalHost((await headers()).get("host"));

  return {
    ...BASE_METADATA,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, dict } = await getI18n();

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${cinzel.variable} ${cormorant.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers locale={locale} dict={dict}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
