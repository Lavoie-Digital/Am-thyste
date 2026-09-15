import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { ordersCol } from "@/lib/firebase/collections";
import { sendEmail } from "@/lib/email/sendgrid";
import { orderConfirmationEmail, orderOwnerEmail, unrecordedOrderEmail } from "@/lib/email/templates";
import { getOwnerEmails } from "@/lib/data/settings";
import type { Address, Locale, Order, OrderLineItem, PricingContext } from "@/lib/types";

export type NewPaidOrderInput = {
  userId: string | null;
  email: string;
  pricingContext: PricingContext;
  lineItems: OrderLineItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentId: string;
  /** Set when reconstructed from the webhook fallback path (see app/api/square/webhook). */
  reconstructed?: boolean;
  locale: Locale;
};

export type RecordedOrder = {
  /** Firestore id of the order, or null when the write failed. */
  orderId: string | null;
  /** False when the payment was captured but no order document exists. */
  recorded: boolean;
};

/**
 * Records a completed Square payment as a paid Order and fires the same two
 * confirmation emails the old Stripe webhook sent. Idempotent on `paymentId`
 * so the synchronous /pay path and the webhook safety net can both call this
 * without creating duplicate orders or double-sending emails.
 *
 * The card is already charged by the time this runs, so it never throws on a
 * failed write: it reports the failure back to the caller and alerts the owner
 * by email instead. A paid order must never disappear just because Firestore
 * refused the document.
 */
export async function recordPaidOrder(input: NewPaidOrderInput): Promise<RecordedOrder> {
  const order = {
    userId: input.userId,
    email: input.email,
    pricingContext: input.pricingContext,
    status: "paid" as const,
    lineItems: input.lineItems,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    currency: "cad" as const,
    shippingAddress: input.shippingAddress,
    square: {
      paymentId: input.paymentId,
      ...(input.reconstructed ? { reconstructed: true } : {}),
    },
    createdAt: FieldValue.serverTimestamp(),
    paidAt: FieldValue.serverTimestamp(),
  };

  let orderId: string | null = null;
  let writeError: unknown = null;

  try {
    const db = getAdminDb();
    if (!db) throw new Error("Firestore not configured");

    const existing = await ordersCol(db)
      .where("square.paymentId", "==", input.paymentId)
      .limit(1)
      .get();
    if (!existing.empty) return { orderId: existing.docs[0].id, recorded: true };

    orderId = (await ordersCol(db).add(order)).id;
  } catch (err) {
    writeError = err;
    // Loud and searchable: this line plus the owner email are the only trace
    // left of a sale that Square already captured.
    console.error(`[square] ORDER WRITE FAILED for payment ${input.paymentId}:`, err);
  }

  // Falls back to the Square payment id so the buyer still has a reference to
  // quote even when no order document was created.
  const orderForEmail: Order = {
    ...(order as unknown as Order),
    id: orderId ?? input.paymentId,
    createdAt: Date.now(),
  };

  // Confirmation to the customer (no-op if SendGrid unconfigured — sendEmail
  // never throws). Sent regardless of the write: she paid, she gets a receipt.
  if (input.email) {
    const mail = orderConfirmationEmail(orderForEmail, input.locale);
    await sendEmail({ to: input.email, subject: mail.subject, html: mail.html });
  }

  // Notify the store owner of the new order — or warn her that a paid order is
  // missing from the admin area and has to be handled by hand.
  try {
    const ownerEmails = await getOwnerEmails();
    if (ownerEmails.length > 0) {
      const ownerMail = writeError
        ? unrecordedOrderEmail(orderForEmail, input.paymentId, writeError)
        : orderOwnerEmail(orderForEmail, input.locale);
      await sendEmail({ to: ownerEmails, subject: ownerMail.subject, html: ownerMail.html });
    }
  } catch (err) {
    console.error("[square] owner order notification failed:", err);
  }

  return { orderId, recorded: !writeError };
}
