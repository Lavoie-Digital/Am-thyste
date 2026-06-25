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
  email: z.string().email(),
  shippingAddress: z.object({
    name: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional().default(""),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1).default("Canada"),
  }),
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
    const unitAmount = resolveUnitAmount(product, context, item.sizeId);
    subtotal += unitAmount * item.quantity;
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "cad",
        unit_amount: unitAmount,
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
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: parsed.email,
      shipping_options:
        shipping > 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: { amount: shipping, currency: "cad" },
                  display_name: locale === "fr" ? "Livraison" : "Shipping",
                },
              },
            ]
          : undefined,
      metadata: {
        pricingContext: context,
        userId: viewer?.uid ?? "",
        locale,
        shippingName: parsed.shippingAddress.name,
        shippingLine1: parsed.shippingAddress.line1,
        shippingCity: parsed.shippingAddress.city,
        shippingProvince: parsed.shippingAddress.province,
        shippingPostal: parsed.shippingAddress.postalCode,
        shippingCountry: parsed.shippingAddress.country,
      },
      success_url: `${origin}/checkout/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/annule`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[stripe] checkout session failed:", err);
    return NextResponse.json({ ok: false, error: "stripe-error" }, { status: 500 });
  }
}
