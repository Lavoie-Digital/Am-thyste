import type { PricingContext, Product, Viewer } from "./types";

/**
 * Single source of truth for which price set a viewer is entitled to.
 * Only approved pros (and admins) get reseller pricing.
 */
export function pricingContextFor(viewer: Viewer | null): PricingContext {
  if (!viewer) return "market";
  if (viewer.role === "admin") return "reseller";
  if (viewer.role === "pro" && viewer.proStatus === "approved") return "reseller";
  return "market";
}

/**
 * Resolves the authoritative unit amount (cents) for a product/size under a
 * given pricing context. Size-level overrides take precedence over product-level.
 * This must always run server-side from Firestore data — never trust the client.
 */
export function resolveUnitAmount(
  product: Product,
  context: PricingContext,
  sizeId?: string,
): number {
  const size = sizeId ? product.sizes.find((s) => s.id === sizeId) : undefined;

  if (context === "reseller") {
    return (
      size?.resellerPrice ??
      product.resellerPrice ??
      size?.marketPrice ??
      product.marketPrice
    );
  }
  return size?.marketPrice ?? product.marketPrice;
}
