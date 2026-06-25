import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { getAllProductsRaw } from "@/lib/data/products";
import { listOrders, listProUsers } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export default async function DashboardHome() {
  const { dict, locale } = await getI18n();
  const [products, orders, pros] = await Promise.all([
    getAllProductsRaw(),
    listOrders(),
    listProUsers(),
  ]);
  const pendingPros = pros.filter((p) => p.proStatus === "pending").length;
  const revenue = orders.filter((o) => o.status === "paid" || o.status === "fulfilled").reduce((s, o) => s + o.total, 0);

  const cards = [
    { label: dict.dashboard.products, value: String(products.length), href: "/tableau-de-bord/produits" },
    { label: dict.dashboard.orders, value: String(orders.length), href: "/tableau-de-bord/commandes" },
    { label: dict.admin.pros, value: `${pendingPros} ⏳`, href: "/admin/pros" },
    { label: dict.dashboard.orderTotal, value: formatPrice(revenue, locale), href: "/tableau-de-bord/commandes" },
  ];

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amethyst-300/70">Améthyste</p>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-amethyst-50">{dict.dashboard.title}</h1>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl glass p-6 transition-all hover:ring-amethyst hover:-translate-y-0.5">
            <p className="text-xs uppercase tracking-[0.15em] text-amethyst-300/70">{c.label}</p>
            <p className="mt-3 font-display text-3xl text-amethyst-50">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
