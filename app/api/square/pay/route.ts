import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { squareConfigured, squareFetch, squareLocationId } from "@/lib/square";
import { verifySession } from "@/lib/auth/dal";
import { getSettings, computeShipping } from "@/lib/data/settings";
import { pricingContextFor } from "@/lib/pricing";
import { priceCartItems } from "@/lib/orders/priceCart";
import { recordPaidOrder } from "@/lib/orders/fulfill";
import { computeTax } from "@/lib/tax/canada";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/types";

const addressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(2).max(2),
  postalCode: z.string().min(1),
});

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
  shippingAddress: addressSchema,
  sourceId: z.string().min(1),
  // Client-generated, stable per checkout attempt — dedupes accidental
  // double-submits at Square's end instead of risking a double charge.
  idempotencyKey: z.string().min(1).max(45),
});

interface SquarePayment {
  id: string;
  status: "COMPLETED" | "APPROVED" | "PENDING" | "FAILED" | "CANCELED";
}

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
  const locale = (await getLocale()) as Locale;
  const settings = await getSettings();

  // Recompute everything server-side — the buyer's browser is never trusted for amounts.
  const priced = await priceCartItems(parsed.items, context);
  if (!priced.ok) {
    const status = priced.error === "pro-only" ? 403 : 400;
    return NextResponse.json({ ok: false, error: priced.error }, { status });
  }

  const shipping = computeShipping(priced.subtotal, settings);
  const tax = computeTax(priced.subtotal + shipping, parsed.shippingAddress.province);
  const total = priced.subtotal + shipping + tax;

  const { name, line1, line2, city, province, postalCode } = parsed.shippingAddress;

  const { ok, data } = await squareFetch<{ payment?: SquarePayment; errors?: Array<{ detail?: string }> }>(
    "/v2/payments",
    {
      method: "POST",
      body: {
        source_id: parsed.sourceId,
        idempotency_key: parsed.idempotencyKey,
        amount_money: { amount: total, currency: "CAD" },
        location_id: squareLocationId(),
        buyer_email_address: parsed.email,
        reference_id: viewer?.uid || undefined,
        note: "Amethyste — commande boutique",
        shipping_address: {
          address_line_1: line1,
          address_line_2: line2 || undefined,
          locality: city,
          administrative_district_level_1: province.toUpperCase(),
          postal_code: postalCode,
          country: "CA",
        },
      },
    },
  );

  if (!ok || !data?.payment || data.payment.status !== "COMPLETED") {
    console.error("[square] payment failed:", data?.errors ?? data);
    return NextResponse.json({ ok: false, error: "payment-declined" }, { status: 402 });
  }

  const orderId = await recordPaidOrder({
    userId: viewer?.uid ?? null,
    email: parsed.email,
    pricingContext: context,
    lineItems: priced.lineItems,
    subtotal: priced.subtotal,
    shipping,
    tax,
    total,
    shippingAddress: {
      name,
      line1,
      line2: line2 || undefined,
      city,
      province: province.toUpperCase(),
      postalCode,
      country: "CA",
    },
    paymentId: data.payment.id,
    locale,
  });

  return NextResponse.json({ ok: true, orderId });
}
