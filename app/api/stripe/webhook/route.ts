import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase/admin";
import { ordersCol } from "@/lib/firebase/collections";
import { sendEmail } from "@/lib/email/sendgrid";
import { orderConfirmationEmail } from "@/lib/email/templates";
import type { Locale, Order, OrderLineItem, PricingContext } from "@/lib/types";

// Stripe webhooks must read the RAW body to verify the signature.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured || !stripe || !webhookSecret || webhookSecret.includes("placeholder")) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false, error: "no-signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe] webhook signature verification failed:", err);
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await fulfillOrder(stripe, session);
  }

  return NextResponse.json({ received: true });
}

async function fulfillOrder(stripe: Stripe, session: Stripe.Checkout.Session) {
  const db = getAdminDb();
  if (!db) return;

  // Idempotency: one order per checkout session.
  const existing = await ordersCol(db).where("stripe.checkoutSessionId", "==", session.id).limit(1).get();
  if (!existing.empty) return;

  const lineItemsResp = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const m = session.metadata ?? {};
  const locale = (m.locale as Locale) || "fr";

  const lineItems: OrderLineItem[] = lineItemsResp.data.map((li) => {
    const name = li.description ?? "";
    return {
      productId: "",
      nameSnapshot: { fr: name, en: name },
      unitAmount: li.price?.unit_amount ?? Math.round((li.amount_subtotal ?? 0) / (li.quantity || 1)),
      quantity: li.quantity ?? 1,
    };
  });

  const subtotal = lineItems.reduce((s, li) => s + li.unitAmount * li.quantity, 0);
  const total = session.amount_total ?? subtotal;
  const shipping = Math.max(0, total - subtotal);
  const email = session.customer_details?.email || session.customer_email || "";

  const order = {
    userId: m.userId || null,
    email,
    pricingContext: (m.pricingContext as PricingContext) || "market",
    status: "paid",
    lineItems,
    subtotal,
    shipping,
    total,
    currency: "cad",
    shippingAddress: {
      name: m.shippingName || session.customer_details?.name || "",
      line1: m.shippingLine1 || "",
      city: m.shippingCity || "",
      province: m.shippingProvince || "",
      postalCode: m.shippingPostal || "",
      country: m.shippingCountry || "Canada",
    },
    stripe: {
      checkoutSessionId: session.id,
      paymentIntentId: (session.payment_intent as string) || undefined,
    },
    createdAt: FieldValue.serverTimestamp(),
    paidAt: FieldValue.serverTimestamp(),
  };

  const ref = await ordersCol(db).add(order);

  // Send confirmation email (no-op if SendGrid unconfigured).
  if (email) {
    const orderForEmail: Order = {
      ...(order as unknown as Order),
      id: ref.id,
      createdAt: Date.now(),
    };
    const mail = orderConfirmationEmail(orderForEmail, locale);
    await sendEmail({ to: email, subject: mail.subject, html: mail.html });
  }
}
