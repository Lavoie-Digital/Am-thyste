import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { getSettings } from "@/lib/data/settings";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Navbar />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
