"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/lib/auth/AuthContext";

// Singleton Stripe.js loader — created once per browser session.
const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!pubKey || pubKey.includes("placeholder")) return null;
  if (!stripePromise) stripePromise = loadStripe(pubKey);
  return stripePromise;
}

export function CheckoutModal() {
  const { checkoutOpen, closeCheckout, items } = useCart();
  const { dict } = useLocale();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutOpen || items.length === 0) return;

    let cancelled = false;
    (async () => {
      // Fresh session per open — clears any prior secret/error (async, not sync-in-effect).
      setError(null);
      setClientSecret(null);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, sizeId: i.sizeId, quantity: i.quantity })),
            email: user?.email || undefined,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.reason === "stripe-not-configured") {
          setError(dict.checkout.notConfigured);
        } else {
          setError(dict.checkout.loadError);
        }
      } catch {
        if (!cancelled) setError(dict.checkout.loadError);
      }
    })();

    return () => {
      // On close / deps change, abandon the in-flight request and reset for next open.
      cancelled = true;
      setClientSecret(null);
      setError(null);
    };
  }, [checkoutOpen, items, user?.email, dict]);

  const stripe = getStripePromise();

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCheckout}
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
              <button
                onClick={closeCheckout}
                aria-label={dict.common.cancel}
                className="rounded-full p-1.5 text-ink/65 hover:bg-ink/[0.04] hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div className="min-h-[240px] flex-1 overflow-y-auto p-4 sm:p-6">
              {error ? (
                <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm text-gold">
                  {error}
                </p>
              ) : !stripe ? (
                <p className="px-4 py-10 text-center text-sm text-ink/55">{dict.checkout.notConfigured}</p>
              ) : clientSecret ? (
                <EmbeddedCheckoutProvider key={clientSecret} stripe={stripe} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-amethyst-400" />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
