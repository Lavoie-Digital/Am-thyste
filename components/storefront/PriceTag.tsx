"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Renders a product price. A reseller price (only present for approved pros —
 * the server strips it otherwise) becomes primary, with the market price shown
 * struck through and a discreet "Pro" marker.
 */
export function PriceTag({
  marketPrice,
  resellerPrice,
  size = "md",
  align = "left",
  className,
}: {
  marketPrice: number;
  resellerPrice?: number;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  className?: string;
}) {
  const { locale, dict } = useLocale();
  const hasReseller = typeof resellerPrice === "number";
  const primary = hasReseller ? resellerPrice! : marketPrice;

  const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-1",
        align === "right" && "justify-end",
        className,
      )}
    >
      <span className={cn("font-serif-lux tracking-wide", hasReseller ? "text-gold-soft" : "text-ivory", sizes[size])}>
        {formatPrice(primary, locale)}
      </span>
      {hasReseller && (
        <>
          <span className="text-xs text-amethyst-200/40 line-through">{formatPrice(marketPrice, locale)}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70">{dict.common.resellerPrice}</span>
        </>
      )}
    </div>
  );
}
