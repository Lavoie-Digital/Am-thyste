import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/auth/dal";
import { listOrders } from "@/lib/data/admin";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function OrdersPage() {
  await requireRole("admin", "/pro/connexion?redirect=/tableau-de-bord/commandes");
  const { dict } = await getI18n();
  const orders = await listOrders();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-ink">{dict.dashboard.orders}</h1>
      </header>
      <OrdersTable initial={orders} />
    </div>
  );
}
