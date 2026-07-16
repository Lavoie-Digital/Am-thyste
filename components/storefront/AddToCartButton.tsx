"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ProductDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  sizeId,
  quantity = 1,
  className,
  fullWidth,
  tone = "fill",
}: {
  product: ProductDTO;
  sizeId?: string;
  quantity?: number;
  className?: string;
  fullWidth?: boolean;
  /** "fill" = ivory primary (detail page); "line" = hairline (cards). */
  tone?: "fill" | "line";
}) {
  const { add } = useCart();
  const { dict } = useLocale();
  const { role, proStatus } = useAuth();
  const [added, setAdded] = useState(false);

  // Pro-only products stay visible to everyone, but only approved pros / admins
  // may purchase. This is a UX gate; the server re-checks it at checkout.
  const canBuy = role === "admin" || (role === "pro" && proStatus === "approved");
  if (product.proOnly && !canBuy) {
    return (
      <Link
        href="/pro"
        className={cn(
          "inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-6 text-center text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors hover:border-ink/40 hover:bg-ink/[0.03]",
          fullWidth && "w-full",
          className,
        )}
      >
        {dict.shop.proOnlyCta}
      </Link>
    );
  }

  const handleAdd = () => {
    const size = sizeId ? product.sizes.find((s) => s.id === sizeId) : product.sizes[0];
    const unit = product.resellerPrice ?? size?.marketPrice ?? product.marketPrice;
    add({
      productId: product.id,
      slug: product.slug,
      sizeId: size?.id,
      name: product.name,
      image: product.images[0],
      quantity,
      displayUnitAmount: unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      onClick={handleAdd}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-6 text-xs uppercase tracking-[0.18em] transition-colors duration-500",
        tone === "fill"
          ? "bg-ink text-ivory hover:bg-amethyst-800"
          : "border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
        fullWidth && "w-full",
        className,
      )}
    >
      {added ? dict.common.added : dict.common.addToCart}
    </button>
  );
}
