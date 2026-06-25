import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getI18n } from "@/lib/i18n/server";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.amethystehairproducts.com"),
  title: {
    default: "Améthyste — Hair Botox & Soins capillaires professionnels",
    template: "%s · Améthyste",
  },
  description:
    "Améthyste — Hair Botox et soins capillaires haut de gamme. Réparation intense, brillance et nutrition profonde. Ce n'est pas simplement un soin, c'est un rituel.",
  keywords: ["hair botox", "soin capillaire", "kératine", "Améthyste", "Rimouski", "Québec"],
  openGraph: {
    title: "Améthyste — Hair Botox",
    description: "Soins capillaires professionnels haut de gamme. Un rituel de transformation.",
    type: "website",
    locale: "fr_CA",
    siteName: "Améthyste",
  },
  icons: { icon: "/logo.jpeg" },
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
