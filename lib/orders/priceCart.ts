import "server-only";
import { getProductByIdRaw } from "@/lib/data/products";
import { resolveUnitAmount } from "@/lib/pricing";
import type { OrderLineItem, PricingContext } from "@/lib/types";

export type CartInputItem = { productId: string; sizeId?: string; quantity: number };

export type PricedCart =
  | { ok: true; lineItems: OrderLineItem[]; subtotal: number }
  | { ok: false; error: "empty-cart" | "pro-only" | "out-of-stock" };

/**
 * Recomputes line items + subtotal from Firestore for a raw cart — the
 * single source of truth shared by the checkout preview and the pay route.
 * Client-submitted prices are never trusted.
 */
export async function priceCartItems(
  items: CartInputItem[],
  context: PricingContext,
): Promise<PricedCart> {
  const lineItems: OrderLineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await getProductByIdRaw(item.productId);
    if (!product || !product.active) continue;
    // Pro-only products can only be purchased under the reseller context
    // (approved pros / admins). Reject rather than silently drop so the
    // buyer isn't charged for a partial order.
    if (product.proOnly && context !== "reseller") {
      return { ok: false, error: "pro-only" };
    }
    // Same reasoning: an out-of-stock item fails the whole cart instead of
    // being silently dropped from an order the buyer thinks is complete.
    if (product.stockStatus === "out_of_stock") {
      return { ok: false, error: "out-of-stock" };
    }
    const unitAmount = resolveUnitAmount(product, context, item.sizeId);
    subtotal += unitAmount * item.quantity;
    lineItems.push({
      productId: product.id,
      sizeId: item.sizeId,
      nameSnapshot: product.name,
      unitAmount,
      quantity: item.quantity,
      ...(product.stockStatus === "backorder"
        ? { backorderDelay: product.backorderDelay ?? { fr: "", en: "" } }
        : {}),
    });
  }

  if (lineItems.length === 0) return { ok: false, error: "empty-cart" };
  return { ok: true, lineItems, subtotal };
}
