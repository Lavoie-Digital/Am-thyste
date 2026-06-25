"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Mark } from "@/components/ui/icons";

export function CheckoutSuccess() {
  const { clear } = useCart();
  const { dict } = useLocale();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="flex min-h-[80svh] items-center justify-center py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-lg px-6"
      >
        <Mark className="mx-auto mb-7 h-6 w-6 text-gold" />
        <h1 className="heading text-4xl">{dict.checkout.successTitle}</h1>
        <p className="mt-5 leading-relaxed text-ink/60">{dict.checkout.successDesc}</p>
        <Link href="/boutique" className="mt-9 inline-flex h-[3.25rem] items-center rounded-full bg-ink px-9 text-xs uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-amethyst-800">
          {dict.checkout.backToShop}
        </Link>
      </motion.div>
    </div>
  );
}
