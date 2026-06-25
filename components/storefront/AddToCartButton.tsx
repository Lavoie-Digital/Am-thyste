"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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
  const [added, setAdded] = useState(false);

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
          ? "bg-ivory text-night-900 hover:bg-[#e3d8c6]"
          : "border border-amethyst-300/25 text-ivory hover:border-amethyst-300/50 hover:bg-white/[0.03]",
        fullWidth && "w-full",
        className,
      )}
    >
      {added ? dict.common.added : dict.common.addToCart}
    </button>
  );
}
