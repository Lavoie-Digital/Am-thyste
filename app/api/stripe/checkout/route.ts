import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { verifySession } from "@/lib/auth/dal";
import { getProductByIdRaw } from "@/lib/data/products";
import { getSettings, computeShipping } from "@/lib/data/settings";
import { pricingContextFor, resolveUnitAmount } from "@/lib/pricing";
import { getLocale } from "@/lib/i18n/server";
import { pick } from "@/lib/utils";
import type { Locale } from "@/lib/types";

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
  // Optional prefill; Stripe's embedded form collects the authoritative email + address.
  email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  if (!stripeConfigured) {
    return NextResponse.json({ ok: false, reason: "stripe-not-configured" }, { status: 200 });
  }
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ ok: false, reason: "stripe-not-configured" }, { status: 200 });

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  // Pricing context comes from the SERVER-verified viewer, never the client.
  const viewer = await verifySession();
  const context = pricingContextFor(viewer);
  const locale = (await getLocale()) as Locale;
  const settings = await getSettings();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  // Recompute every price from Firestore — client prices are ignored.
  const lineItems = [];
  let subtotal = 0;
  for (const item of parsed.items) {
    const product = await getProductByIdRaw(item.productId);
    if (!product || !product.active) continue;
    // Pro-only products can only be purchased under the reseller context
    // (approved pros / admins). Reject rather than silently drop so the buyer
    // isn't charged for a partial order.
    if (product.proOnly && context !== "reseller") {
      return NextResponse.json({ ok: false, error: "pro-only" }, { status: 403 });
    }
    const unitAmount = resolveUnitAmount(product, context, item.sizeId);
    subtotal += unitAmount * item.quantity;
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "cad",
        unit_amount: unitAmount,
        // Prices are tax-exclusive; Stripe Tax adds GST/QST on top per the customer address.
        tax_behavior: "exclusive" as const,
        product_data: {
          name: pick(product.name, locale),
          images: product.images[0]?.startsWith("http") ? [product.images[0]] : undefined,
        },
      },
    });
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ ok: false, error: "empty-cart" }, { status: 400 });
  }

  const shipping = computeShipping(subtotal, settings);

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: parsed.email || undefined,
      // Stripe Tax computes GST/QST (and other provinces) from the collected address.
      automatic_tax: { enabled: true },
      // Stripe's embedded form collects the shipping address (Canada only).
      shipping_address_collection: { allowed_countries: ["CA"] },
      shipping_options:
        shipping > 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: shipping, currency: "cad" },
                  display_name: locale === "fr" ? "Livraison" : "Shipping",
                  // Tax the shipping fee too, exclusive of the displayed amount.
                  tax_behavior: "exclusive",
                },
              },
            ]
          : undefined,
      metadata: {
        pricingContext: context,
        userId: viewer?.uid ?? "",
        locale,
      },
      return_url: `${origin}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ ok: true, clientSecret: session.client_secret });
  } catch (err) {
    console.error("[stripe] checkout session failed:", err);
    return NextResponse.json({ ok: false, error: "stripe-error" }, { status: 500 });
  }
}
