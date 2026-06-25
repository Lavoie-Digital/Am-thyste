"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { formatPrice, pick } from "@/lib/utils";

const FREE_SHIPPING = 10000;
const FLAT_RATE = 1500;

export function CheckoutForm() {
  const { items, subtotal } = useCart();
  const { dict, locale } = useLocale();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: user?.email ?? "",
    name: user?.displayName ?? "",
    line1: "",
    line2: "",
    city: "",
    province: "Québec",
    postalCode: "",
    country: "Canada",
  });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING ? 0 : FLAT_RATE;
  const total = subtotal + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, sizeId: i.sizeId, quantity: i.quantity })),
          email: form.email,
          shippingAddress: {
            name: form.name,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            country: form.country,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.reason === "stripe-not-configured") {
        setError(
          locale === "fr"
            ? "Le paiement n'est pas encore configuré. Ajoutez vos clés Stripe dans .env.local."
            : "Payments aren't configured yet. Add your Stripe keys to .env.local.",
        );
      } else {
        setError(dict.auth.errorGeneric);
      }
    } catch {
      setError(dict.auth.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl glass p-12 text-center">
        <p className="text-ink/65">{dict.cart.empty}</p>
        <Link href="/boutique" className="mt-6 inline-flex h-12 items-center rounded-full bg-[#211a2c] px-7 text-xs uppercase tracking-[0.16em] text-[#faf7f2] transition-colors hover:bg-[#382c42]">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      {/* Address form */}
      <form onSubmit={submit} className="space-y-5">
        <h2 className="font-display text-xl tracking-wide text-ink">{dict.checkout.shippingInfo}</h2>
        <Field label={dict.common.email}><input type="email" required value={form.email} onChange={upd("email")} className={inputClass} /></Field>
        <Field label={dict.common.name}><input required value={form.name} onChange={upd("name")} className={inputClass} /></Field>
        <Field label="Adresse"><input required value={form.line1} onChange={upd("line1")} className={inputClass} /></Field>
        <Field label="Complément" ><input value={form.line2} onChange={upd("line2")} className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ville"><input required value={form.city} onChange={upd("city")} className={inputClass} /></Field>
          <Field label="Province"><input required value={form.province} onChange={upd("province")} className={inputClass} /></Field>
          <Field label="Code postal"><input required value={form.postalCode} onChange={upd("postalCode")} className={inputClass} /></Field>
        </div>
        {error && <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">{error}</p>}
        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? dict.checkout.redirecting : `${dict.checkout.payNow} · ${formatPrice(total, locale)}`}
        </Button>
        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-ink/35">Paiement sécurisé · Stripe</p>
      </form>

      {/* Summary */}
      <div className="h-fit rounded-3xl glass p-6">
        <h2 className="mb-4 font-display text-lg tracking-wide text-ink">{dict.cart.title}</h2>
        <div className="space-y-4">
          {items.map((i) => (
            <div key={`${i.productId}-${i.sizeId ?? ""}`} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-ink/10">
                {i.image && <Image src={i.image} alt={pick(i.name, locale)} fill sizes="56px" className="object-cover" unoptimized={i.image.startsWith("data:")} />}
              </div>
              <div className="flex flex-1 justify-between text-sm">
                <span className="text-ink/70">{pick(i.name, locale)} × {i.quantity}</span>
                <span className="text-ink">{formatPrice(i.displayUnitAmount * i.quantity, locale)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
          <div className="flex justify-between text-ink/65"><span>{dict.common.subtotal}</span><span>{formatPrice(subtotal, locale)}</span></div>
          <div className="flex justify-between text-ink/65"><span>{dict.common.shipping}</span><span>{shipping === 0 ? dict.common.free : formatPrice(shipping, locale)}</span></div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium text-ink"><span>{dict.common.total}</span><span className="text-gold">{formatPrice(total, locale)}</span></div>
        </div>
      </div>
    </div>
  );
}
