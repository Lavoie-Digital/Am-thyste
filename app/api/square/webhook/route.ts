import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { ordersCol } from "@/lib/firebase/collections";
import { recordPaidOrder } from "@/lib/orders/fulfill";

interface SquarePayment {
  id: string;
  status: string;
  reference_id?: string;
  buyer_email_address?: string;
  amount_money?: { amount: number; currency: string };
  shipping_address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
    country?: string;
  };
}

interface SquareRefund {
  payment_id: string;
  status: string;
}

interface SquareWebhookEvent {
  type: string;
  data?: { object?: { payment?: SquarePayment; refund?: SquareRefund } };
}

function verifySignature(rawBody: string, signature: string, signingKey: string, notificationUrl: string): boolean {
  const expected = createHmac("sha256", signingKey).update(notificationUrl + rawBody).digest("base64");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Square webhooks must read the RAW body to verify the signature.
export async function POST(request: NextRequest) {
  const signingKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signingKey || signingKey.includes("placeholder")) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
  }

  const body = await request.text();
  const sig = request.headers.get("x-square-hmacsha256-signature");
  if (!sig) return NextResponse.json({ ok: false, error: "no-signature" }, { status: 400 });

  const notificationUrl = process.env.SQUARE_WEBHOOK_URL || `${request.nextUrl.origin}/api/square/webhook`;
  if (!verifySignature(body, sig, signingKey, notificationUrl)) {
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 400 });
  }

  let event: SquareWebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, error: "bad-payload" }, { status: 400 });
  }

  if (event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment && payment.status === "COMPLETED") await ensureRecorded(payment);
  }

  if (event.type === "refund.updated") {
    const refund = event.data?.object?.refund;
    if (refund && refund.status === "COMPLETED") await markRefunded(refund.payment_id);
  }

  return NextResponse.json({ received: true });
}

/**
 * Safety net: the synchronous /api/square/pay path already records paid
 * orders. This only fires if that request died after Square confirmed the
 * charge but before our own write — so the order didn't get lost. Itemization
 * isn't recoverable from a bare Payment object, so this creates a best-effort
 * single-line placeholder order flagged `reconstructed` for manual follow-up.
 */
async function ensureRecorded(payment: SquarePayment) {
  const total = payment.amount_money?.amount ?? 0;
  const addr = payment.shipping_address;

  await recordPaidOrder({
    userId: payment.reference_id || null,
    email: payment.buyer_email_address || "",
    pricingContext: "market",
    lineItems: [
      {
        productId: "",
        nameSnapshot: { fr: "Commande (détail indisponible)", en: "Order (detail unavailable)" },
        unitAmount: total,
        quantity: 1,
      },
    ],
    subtotal: total,
    shipping: 0,
    tax: 0,
    total,
    shippingAddress: {
      name: "",
      line1: addr?.address_line_1 || "",
      line2: addr?.address_line_2,
      city: addr?.locality || "",
      province: addr?.administrative_district_level_1 || "",
      postalCode: addr?.postal_code || "",
      country: addr?.country || "CA",
    },
    paymentId: payment.id,
    reconstructed: true,
    locale: "fr",
  });
}

async function markRefunded(paymentId: string) {
  const db = getAdminDb();
  if (!db) return;
  const snap = await ordersCol(db).where("square.paymentId", "==", paymentId).limit(1).get();
  if (snap.empty) return;
  await snap.docs[0].ref.update({ status: "refunded" });
}
