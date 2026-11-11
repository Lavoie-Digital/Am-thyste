import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { getSettings } from "@/lib/data/settings";
import { ProOnlyNotice } from "@/components/storefront/ProOnlyNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { getLocale } from "@/lib/i18n/server";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const settings = await getSettings();

  return (
    <>
      <JsonLd data={[organizationJsonLd(locale), websiteJsonLd(locale)]} />
      <Navbar />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
      <ProOnlyNotice />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
