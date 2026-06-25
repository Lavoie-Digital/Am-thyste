import { getI18n } from "@/lib/i18n/server";
import { listOrders } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage() {
  const { dict, locale } = await getI18n();
  const orders = await listOrders();

  const fmtDate = (ms: number) =>
    ms ? new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(ms) : "—";

  const statusStyle: Record<string, string> = {
    paid: "bg-gold/15 text-gold",
    fulfilled: "bg-emerald-500/15 text-emerald-300",
    pending: "bg-amethyst-500/20 text-ink",
    cancelled: "bg-ink/[0.04] text-ink/55",
    refunded: "bg-red-500/15 text-red-300",
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-ink">{dict.dashboard.orders}</h1>
      </header>

      {orders.length === 0 ? (
        <p className="rounded-2xl glass p-10 text-center text-ink/55">{dict.dashboard.noOrders}</p>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_auto] gap-4 border-b border-ink/10 px-6 py-4 text-xs uppercase tracking-[0.15em] text-ink-mute">
            <span>{dict.dashboard.orderId}</span>
            <span>{dict.common.email}</span>
            <span>{dict.dashboard.orderDate}</span>
            <span>{dict.dashboard.orderTotal}</span>
            <span className="text-right">{dict.dashboard.orderStatus}</span>
          </div>
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-[1.5fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-ink/8 px-6 py-4 text-sm last:border-0">
              <span className="truncate font-mono text-xs text-ink/65">{o.id}</span>
              <span className="truncate text-ink/70">{o.email}</span>
              <span className="text-ink/55">{fmtDate(o.createdAt)}</span>
              <span className="font-medium text-ink">{formatPrice(o.total, locale)}</span>
              <span className="text-right">
                <span className={`rounded-full px-3 py-1 text-xs ${statusStyle[o.status] ?? statusStyle.pending}`}>{o.status}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
