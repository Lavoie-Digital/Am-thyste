"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { updateOrderStatus } from "@/lib/actions/orders";
import { formatPrice, pick } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled", "refunded"];

const statusStyle: Record<OrderStatus, string> = {
  paid: "bg-gold/15 text-gold",
  fulfilled: "bg-emerald-500/15 text-emerald-600",
  pending: "bg-amethyst-500/20 text-ink",
  cancelled: "bg-ink/[0.04] text-ink/55",
  refunded: "bg-red-500/15 text-red-500",
};

export function OrdersTable({ initial }: { initial: Order[] }) {
  const { dict, locale } = useLocale();
  const [rows, setRows] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const statusLabel: Record<OrderStatus, string> =
    locale === "fr"
      ? { pending: "En attente", paid: "Payée", fulfilled: "Expédiée", cancelled: "Annulée", refunded: "Remboursée" }
      : { pending: "Pending", paid: "Paid", fulfilled: "Fulfilled", cancelled: "Cancelled", refunded: "Refunded" };

  const fmtDate = (ms: number) =>
    ms ? new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(ms) : "—";

  const changeStatus = (id: string, status: OrderStatus) => {
    setBusyId(id);
    setRows((r) => r.map((o) => (o.id === id ? { ...o, status } : o)));
    startTransition(async () => {
      await updateOrderStatus(id, status);
      setBusyId(null);
    });
  };

  if (rows.length === 0) {
    return <p className="rounded-2xl glass p-10 text-center text-ink/55">{dict.dashboard.noOrders}</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl glass">
      <div className="grid grid-cols-[1.4fr_2fr_1.2fr_1fr_1.3fr] gap-4 border-b border-ink/10 px-6 py-4 text-xs uppercase tracking-[0.15em] text-ink-mute">
        <span>{dict.dashboard.orderId}</span>
        <span>{dict.common.email}</span>
        <span>{dict.dashboard.orderDate}</span>
        <span>{dict.dashboard.orderTotal}</span>
        <span className="text-right">{dict.dashboard.orderStatus}</span>
      </div>

      {rows.map((o) => {
        const isOpen = expanded === o.id;
        return (
          <div key={o.id} className="border-b border-ink/8 last:border-0">
            <button
              onClick={() => setExpanded(isOpen ? null : o.id)}
              className="grid w-full grid-cols-[1.4fr_2fr_1.2fr_1fr_1.3fr] items-center gap-4 px-6 py-4 text-left text-sm transition-colors hover:bg-ink/[0.02]"
            >
              <span className="truncate font-mono text-xs text-ink/65">{o.id}</span>
              <span className="truncate text-ink/70">{o.email}</span>
              <span className="text-ink/55">{fmtDate(o.createdAt)}</span>
              <span className="font-medium text-ink">{formatPrice(o.total, locale)}</span>
              <span className="flex justify-end">
                <span className={cn("rounded-full px-3 py-1 text-xs", statusStyle[o.status])}>
                  {statusLabel[o.status]}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="grid gap-6 bg-ink/[0.015] px-6 py-5 sm:grid-cols-[1.4fr_1fr]">
                {/* Items + totals */}
                <div>
                  <div className="space-y-1.5">
                    {o.lineItems.map((li, i) => (
                      <div key={i} className="flex justify-between text-sm text-ink/70">
                        <span>{pick(li.nameSnapshot, locale)} × {li.quantity}</span>
                        <span>{formatPrice(li.unitAmount * li.quantity, locale)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
                    <div className="flex justify-between text-ink/55"><span>{dict.common.subtotal}</span><span>{formatPrice(o.subtotal, locale)}</span></div>
                    <div className="flex justify-between text-ink/55"><span>{dict.common.shipping}</span><span>{o.shipping === 0 ? dict.common.free : formatPrice(o.shipping, locale)}</span></div>
                    {(o.discount ?? 0) > 0 && (
                      <div className="flex justify-between text-amethyst-600"><span>{locale === "fr" ? "Points" : "Points"}{o.pointsRedeemed ? ` (−${o.pointsRedeemed} pts)` : ""}</span><span>−{formatPrice(o.discount ?? 0, locale)}</span></div>
                    )}
                    <div className="flex justify-between text-ink/55"><span>{dict.common.tax}</span><span>{formatPrice(o.tax ?? 0, locale)}</span></div>
                    <div className="flex justify-between border-t border-ink/10 pt-1 font-medium text-ink"><span>{dict.common.total}</span><span className="text-gold">{formatPrice(o.total, locale)}</span></div>
                    {(o.pointsEarned ?? 0) > 0 && (
                      <div className="flex justify-between pt-1 text-xs text-ink/45"><span>{locale === "fr" ? "Points gagnés" : "Points earned"}</span><span>+{o.pointsEarned} pts</span></div>
                    )}
                  </div>
                </div>

                {/* Shipping address + status control */}
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.15em] text-ink-mute">{dict.checkout.shippingInfo}</p>
                    <p className="text-sm text-ink/70">
                      {o.shippingAddress.name}<br />
                      {o.shippingAddress.line1}{o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}<br />
                      {o.shippingAddress.city}, {o.shippingAddress.province} {o.shippingAddress.postalCode}<br />
                      {o.shippingAddress.country}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.15em] text-ink-mute">{dict.dashboard.orderStatus}</p>
                    <select
                      value={o.status}
                      disabled={pending && busyId === o.id}
                      onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3 py-2 text-sm text-ink disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
