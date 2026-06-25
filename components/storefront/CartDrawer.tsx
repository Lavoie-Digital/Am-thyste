"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatPrice, pick } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 10000; // display-only; server is authoritative

export function CartDrawer() {
  const { items, isOpen, close, subtotal, setQuantity, remove } = useCart();
  const { dict, locale } = useLocale();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-night-900/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="glass-strong fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col"
            aria-label={dict.cart.title}
          >
            <div className="flex items-center justify-between border-b border-amethyst-300/15 px-6 py-5">
              <h2 className="font-display text-lg tracking-[0.15em] text-amethyst-50">
                {dict.cart.title}
              </h2>
              <button onClick={close} aria-label={dict.common.cancel} className="rounded-full p-1.5 text-amethyst-200/70 hover:bg-white/5 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <p className="text-amethyst-200/70">{dict.cart.empty}</p>
                <Link href="/boutique" onClick={close} className="inline-flex h-12 items-center rounded-full bg-[#efe9e1] px-7 text-xs uppercase tracking-[0.16em] text-[#0b0810] transition-colors hover:bg-[#e3d8c6]">
                  {dict.cart.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-amethyst-300/10 px-6 py-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-night-700">
                    <motion.div
                      className="h-full bg-amethyst-400"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-amethyst-200/70">
                    {remaining > 0
                      ? dict.cart.freeShippingProgress.replace("{amount}", formatPrice(remaining, locale))
                      : dict.cart.freeShippingReached}
                  </p>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.sizeId ?? ""}`} className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-amethyst-300/20">
                        {item.image && (
                          <Image src={item.image} alt={pick(item.name, locale)} fill sizes="80px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-amethyst-50">{pick(item.name, locale)}</p>
                        <p className="text-sm text-gold-soft">{formatPrice(item.displayUnitAmount, locale)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-amethyst-300/20">
                            <button onClick={() => setQuantity(item.productId, item.sizeId, item.quantity - 1)} className="px-2.5 py-1 text-amethyst-100 hover:text-white">−</button>
                            <span className="min-w-6 text-center text-sm text-white">{item.quantity}</span>
                            <button onClick={() => setQuantity(item.productId, item.sizeId, item.quantity + 1)} className="px-2.5 py-1 text-amethyst-100 hover:text-white">+</button>
                          </div>
                          <button onClick={() => remove(item.productId, item.sizeId)} className="text-xs text-amethyst-200/50 hover:text-white">
                            {dict.cart.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-amethyst-300/15 px-6 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amethyst-200/70">{dict.common.subtotal}</span>
                    <span className="font-medium text-white">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-4 flex items-center justify-center rounded-full bg-[#efe9e1] py-3.5 text-xs uppercase tracking-[0.16em] text-[#0b0810] transition-colors hover:bg-[#e3d8c6]"
                  >
                    {dict.cart.checkout}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
