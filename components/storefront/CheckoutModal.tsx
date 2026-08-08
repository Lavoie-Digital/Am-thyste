"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatPrice } from "@/lib/utils";

/* --- Minimal Square Web Payments SDK typing (no official npm types package) --- */
interface SquareCardTokenizeResult {
  status: "OK" | "ERROR";
  token?: string;
}
interface SquareCard {
  attach(selector: string): Promise<void>;
  destroy(): Promise<void>;
  tokenize(): Promise<SquareCardTokenizeResult>;
}
interface SquarePayments {
  card(): Promise<SquareCard>;
}
declare global {
  interface Window {
    Square?: { payments(appId: string, locationId: string): SquarePayments };
  }
}

const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

// Singleton script loader — the SDK is a global script, not an npm package.
let squareScriptPromise: Promise<void> | null = null;
function loadSquareScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Square) return Promise.resolve();
  if (!squareScriptPromise) {
    squareScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://web.squarecdn.com/v1/square.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("square-script-failed"));
      document.head.appendChild(script);
    });
  }
  return squareScriptPromise;
}

const PROVINCES = ["QC", "ON", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE", "YT", "NT", "NU"];

type Step = "loading" | "form" | "paying" | "success" | "error";

export function CheckoutModal() {
  const { checkoutOpen, closeCheckout, items, clear } = useCart();
  const { dict } = useLocale();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [preview, setPreview] = useState<{ subtotal: number; shipping: number } | null>(null);
  const [address, setAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    province: "QC",
    postalCode: "",
  });
  const [email, setEmail] = useState("");
  const cardRef = useRef<SquareCard | null>(null);
  // The card iframe can only be attached once the container is in the DOM,
  // which happens a render *after* we switch to the "form" step.
  const attachedRef = useRef(false);
  const [cardReady, setCardReady] = useState(false);
  // One idempotency key per checkout attempt — reused across accidental
  // double-submits so a network retry can't charge the card twice.
  const idempotencyKeyRef = useRef<string>("");
  const cardContainerId = "sq-card-container";

  useEffect(() => {
    if (!checkoutOpen || items.length === 0) return;

    let cancelled = false;

    (async () => {
      setStep("loading");
      setError(null);
      setPreview(null);
      setCardReady(false);
      attachedRef.current = false;
      setEmail(user?.email || "");
      idempotencyKeyRef.current = crypto.randomUUID();
      try {
        const res = await fetch("/api/square/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, sizeId: i.sizeId, quantity: i.quantity })),
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) {
          if (data.reason === "square-not-configured") setError(dict.checkout.notConfigured);
          else if (data.error === "pro-only") setError(dict.checkout.proOnlyError);
          else setError(dict.checkout.loadError);
          setStep("error");
          return;
        }
        setPreview({ subtotal: data.subtotal, shipping: data.shipping });
      } catch {
        if (!cancelled) {
          setError(dict.checkout.loadError);
          setStep("error");
        }
        return;
      }

      // Separate try/catch: failures here are almost always the Square SDK
      // itself being blocked (ad blockers/privacy extensions commonly block
      // its telemetry beacons), so they get a distinct, actionable message.
      try {
        await loadSquareScript();
        if (cancelled || !window.Square || !appId || !locationId) {
          if (!cancelled) {
            setError(dict.checkout.notConfigured);
            setStep("error");
          }
          return;
        }
        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card();
        if (cancelled) {
          await card.destroy().catch(() => {});
          return;
        }
        // Attaching happens in the effect below: the container only exists
        // once this step change has been committed to the DOM.
        cardRef.current = card;
        setStep("form");
      } catch {
        if (!cancelled) {
          setError(dict.checkout.initError);
          setStep("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
      attachedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutOpen, retryKey]);

  // Mount the card iframe once the form (and therefore its container) is in
  // the DOM. Kept separate from the effect above so `attach` never races the
  // render that creates `#sq-card-container`.
  useEffect(() => {
    if (step !== "form" || !preview) return;
    const card = cardRef.current;
    if (!card || attachedRef.current) return;
    attachedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        await card.attach(`#${cardContainerId}`);
        if (!cancelled) setCardReady(true);
      } catch {
        if (!cancelled) {
          attachedRef.current = false;
          setError(dict.checkout.initError);
          setStep("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, preview]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!cardRef.current || !cardReady) return;
    setStep("paying");
    setError(null);
    try {
      const tokenized = await cardRef.current.tokenize();
      if (tokenized.status !== "OK" || !tokenized.token) {
        setError(dict.checkout.cardError);
        setStep("form");
        return;
      }
      const res = await fetch("/api/square/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, sizeId: i.sizeId, quantity: i.quantity })),
          email,
          shippingAddress: address,
          sourceId: tokenized.token,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error === "pro-only" ? dict.checkout.proOnlyError : dict.checkout.cardError);
        setStep("form");
        return;
      }
      clear();
      setStep("success");
    } catch {
      setError(dict.checkout.cardError);
      setStep("form");
    }
  }

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === "paying" ? undefined : closeCheckout}
            className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={dict.checkout.payTitle}
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-ivory shadow-2xl sm:inset-y-0 sm:my-auto sm:h-fit sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="font-display text-base tracking-[0.15em] text-ink">
                {dict.checkout.payTitle}
              </h2>
              {step !== "paying" && (
                <button
                  onClick={closeCheckout}
                  aria-label={dict.common.cancel}
                  className="rounded-full p-1.5 text-ink/65 hover:bg-ink/[0.04] hover:text-ink"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              )}
            </div>

            <div className="min-h-[240px] flex-1 overflow-y-auto p-4 sm:p-6">
              {step === "loading" && (
                <div className="flex items-center justify-center py-16">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-amethyst-400" />
                </div>
              )}

              {step === "error" && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold">
                    {error}
                  </p>
                  <button
                    onClick={() => setRetryKey((k) => k + 1)}
                    className="inline-flex h-11 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-amethyst-800"
                  >
                    {dict.checkout.retry}
                  </button>
                </div>
              )}

              {step === "success" && (
                <div className="py-10 text-center">
                  <p className="heading text-2xl text-ink">{dict.checkout.successTitle}</p>
                  <p className="mt-3 text-sm text-ink/60">{dict.checkout.successDesc}</p>
                  <button
                    onClick={closeCheckout}
                    className="mt-8 inline-flex h-11 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-amethyst-800"
                  >
                    {dict.checkout.backToShop}
                  </button>
                </div>
              )}

              {(step === "form" || step === "paying") && preview && (
                <form onSubmit={handlePay} className="space-y-5">
                  {error && (
                    <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm text-gold">
                      {error}
                    </p>
                  )}

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-ink/55">
                      <span>{dict.common.subtotal}</span>
                      <span>{formatPrice(preview.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-ink/55">
                      <span>{dict.common.shipping}</span>
                      <span>{preview.shipping === 0 ? dict.common.free : formatPrice(preview.shipping)}</span>
                    </div>
                    <p className="text-xs text-ink/40">{dict.checkout.taxNote}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.15em] text-ink-mute">{dict.checkout.shippingInfo}</p>
                    <input
                      required
                      type="email"
                      placeholder={dict.common.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                    />
                    <input
                      required
                      placeholder={dict.checkout.fullName}
                      value={address.name}
                      onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                    />
                    <input
                      required
                      placeholder={dict.checkout.addressLine1}
                      value={address.line1}
                      onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                    />
                    <input
                      placeholder={dict.checkout.addressLine2}
                      value={address.line2}
                      onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                    />
                    <div className="grid grid-cols-[1.6fr_1fr] gap-3">
                      <input
                        required
                        placeholder={dict.checkout.city}
                        value={address.city}
                        onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                      />
                      <select
                        value={address.province}
                        onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                      >
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      required
                      placeholder={dict.checkout.postalCode}
                      value={address.postalCode}
                      onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value.toUpperCase() }))}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.15em] text-ink-mute">{dict.checkout.cardInfo}</p>
                    <div className="relative">
                      <div id={cardContainerId} className="min-h-[90px] rounded-xl border border-ink/15 bg-white p-3" />
                      {!cardReady && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/15 border-t-amethyst-400" />
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={step === "paying" || !cardReady}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-ink text-xs uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-amethyst-800 disabled:opacity-60"
                  >
                    {step === "paying" ? dict.checkout.paying : dict.checkout.payNow}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
