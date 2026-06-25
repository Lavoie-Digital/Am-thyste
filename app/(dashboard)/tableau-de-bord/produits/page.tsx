import Link from "next/link";
import { ProductList } from "@/components/dashboard/ProductList";
import { getI18n } from "@/lib/i18n/server";
import { getAllProductsRaw } from "@/lib/data/products";

export default async function DashboardProductsPage() {
  const { dict } = await getI18n();
  const products = await getAllProductsRaw();

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-amethyst-50">{dict.dashboard.products}</h1>
        <Link href="/tableau-de-bord/produits/new" className="rounded-full bg-[#efe9e1] px-6 py-2.5 text-xs uppercase tracking-[0.16em] text-[#0b0810] transition-colors hover:bg-[#e3d8c6]">
          {dict.dashboard.newProduct}
        </Link>
      </header>
      <ProductList initial={products} />
    </div>
  );
}
