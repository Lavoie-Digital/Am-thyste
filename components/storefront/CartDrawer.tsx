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
            className="fixed inset-0 z-[60] bg-ivory/85 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="glass-strong fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col"
            aria-label={dict.cart.title}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="font-display text-lg tracking-[0.15em] text-ink">
                {dict.cart.title}
              </h2>
              <button onClick={close} aria-label={dict.common.cancel} className="rounded-full p-1.5 text-ink/65 hover:bg-ink/[0.04] hover:text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <p className="text-ink/65">{dict.cart.empty}</p>
                <Link href="/boutique" onClick={close} className="inline-flex h-12 items-center rounded-full bg-[#211a2c] px-7 text-xs uppercase tracking-[0.16em] text-[#faf7f2] transition-colors hover:bg-[#382c42]">
                  {dict.cart.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-ink/8 px-6 py-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-bone">
                    <motion.div
                      className="h-full bg-amethyst-400"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink/65">
                    {remaining > 0
                      ? dict.cart.freeShippingProgress.replace("{amount}", formatPrice(remaining, locale))
                      : dict.cart.freeShippingReached}
                  </p>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.sizeId ?? ""}`} className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-ink/10">
                        {item.image && (
                          <Image src={item.image} alt={pick(item.name, locale)} fill sizes="80px" className="object-cover" unoptimized={item.image.startsWith("data:")} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-ink">{pick(item.name, locale)}</p>
                        <p className="text-sm text-gold">{formatPrice(item.displayUnitAmount, locale)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-ink/10">
                            <button onClick={() => setQuantity(item.productId, item.sizeId, item.quantity - 1)} className="px-2.5 py-1 text-ink hover:text-ink">−</button>
                            <span className="min-w-6 text-center text-sm text-ink">{item.quantity}</span>
                            <button onClick={() => setQuantity(item.productId, item.sizeId, item.quantity + 1)} className="px-2.5 py-1 text-ink hover:text-ink">+</button>
                          </div>
                          <button onClick={() => remove(item.productId, item.sizeId)} className="text-xs text-ink/45 hover:text-ink">
                            {dict.cart.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ink/10 px-6 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/65">{dict.common.subtotal}</span>
                    <span className="font-medium text-ink">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-4 flex items-center justify-center rounded-full bg-[#211a2c] py-3.5 text-xs uppercase tracking-[0.16em] text-[#faf7f2] transition-colors hover:bg-[#382c42]"
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
