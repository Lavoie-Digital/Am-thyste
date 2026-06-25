"use client";

import { AuthProvider } from "@/lib/auth/AuthContext";
import { CartProvider } from "@/lib/cart/CartContext";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/types";

export function Providers({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider locale={locale} dict={dict}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
