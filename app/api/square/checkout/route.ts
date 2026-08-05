import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { squareConfigured } from "@/lib/square";
import { verifySession } from "@/lib/auth/dal";
import { getSettings, computeShipping } from "@/lib/data/settings";
import { pricingContextFor } from "@/lib/pricing";
import { priceCartItems } from "@/lib/orders/priceCart";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        sizeId: z.string().optional(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1),
});

/**
 * Pricing preview shown before the buyer fills in the Square card form —
 * validates the cart (pro-only gating) and returns subtotal/shipping.
 * Tax depends on the shipping province, computed later in /api/square/pay.
 * No Firestore writes here; the order is only created once payment succeeds.
 */
export async function POST(request: NextRequest) {
  if (!squareConfigured) {
    return NextResponse.json({ ok: false, reason: "square-not-configured" }, { status: 200 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  const viewer = await verifySession();
  const context = pricingContextFor(viewer);
  const settings = await getSettings();

  const priced = await priceCartItems(parsed.items, context);
  if (!priced.ok) {
    const status = priced.error === "pro-only" ? 403 : 400;
    return NextResponse.json({ ok: false, error: priced.error }, { status });
  }

  const shipping = computeShipping(priced.subtotal, settings);
  return NextResponse.json({ ok: true, subtotal: priced.subtotal, shipping });
}
