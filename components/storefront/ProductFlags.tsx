"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick, cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

/**
 * Status pills shown on product cards and product pages: "Professional use
 * only" for pro-only treatments, plus out-of-stock / backorder availability.
 * Renders nothing for a regular in-stock product.
 */
export function ProductFlags({
  product,
  className,
}: {
  product: Pick<ProductDTO, "proOnly" | "stockStatus">;
  className?: string;
}) {
  const { dict } = useLocale();
  const flags: Array<{ label: string; tone: "pro" | "warn" | "muted" }> = [];
  if (product.proOnly) flags.push({ label: dict.shop.proUseOnly, tone: "pro" });
  if (product.stockStatus === "out_of_stock") flags.push({ label: dict.shop.outOfStock, tone: "muted" });
  if (product.stockStatus === "backorder") flags.push({ label: dict.shop.backorder, tone: "warn" });
  if (flags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {flags.map((f) => (
        <span
          key={f.label}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] uppercase leading-none tracking-[0.16em]",
            f.tone === "pro" && "border-amethyst-500/30 bg-amethyst-500/10 text-amethyst-700",
            f.tone === "warn" && "border-ink/25 bg-bone text-ink/80",
            f.tone === "muted" && "border-ink/15 bg-ink/[0.04] text-ink/60",
          )}
        >
          {f.label}
        </span>
      ))}
    </div>
  );
}

/** One-line shipping delay for a backordered product, or null. */
export function BackorderNote({
  product,
  className,
}: {
  product: Pick<ProductDTO, "stockStatus" | "backorderDelay">;
  className?: string;
}) {
  const { dict, locale } = useLocale();
  if (product.stockStatus !== "backorder") return null;
  const delay = product.backorderDelay ? pick(product.backorderDelay, locale).trim() : "";
  return (
    <p className={cn("text-sm text-ink/65", className)}>
      {delay ? dict.shop.backorderDelay.replace("{delay}", delay) : dict.shop.backorderNoDelay}
    </p>
  );
}
