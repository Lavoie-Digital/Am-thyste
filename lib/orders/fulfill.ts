import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { ordersCol } from "@/lib/firebase/collections";
import { sendEmail } from "@/lib/email/sendgrid";
import { orderConfirmationEmail, orderOwnerEmail } from "@/lib/email/templates";
import { getOwnerEmail } from "@/lib/data/settings";
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

/**
 * Records a completed Square payment as a paid Order and fires the same two
 * confirmation emails the old Stripe webhook sent. Idempotent on `paymentId`
 * so the synchronous /pay path and the webhook safety net can both call this
 * without creating duplicate orders or double-sending emails.
 */
export async function recordPaidOrder(input: NewPaidOrderInput): Promise<string> {
  const db = getAdminDb();
  if (!db) throw new Error("Firestore not configured");

  const existing = await ordersCol(db)
    .where("square.paymentId", "==", input.paymentId)
    .limit(1)
    .get();
  if (!existing.empty) return existing.docs[0].id;

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

  const ref = await ordersCol(db).add(order);

  const orderForEmail: Order = { ...(order as unknown as Order), id: ref.id, createdAt: Date.now() };

  // Confirmation to the customer (no-op if SendGrid unconfigured — sendEmail never throws).
  if (input.email) {
    const mail = orderConfirmationEmail(orderForEmail, input.locale);
    await sendEmail({ to: input.email, subject: mail.subject, html: mail.html });
  }

  // Notify the store owner of the new order.
  try {
    const ownerEmail = await getOwnerEmail();
    if (ownerEmail) {
      const ownerMail = orderOwnerEmail(orderForEmail, input.locale);
      await sendEmail({ to: ownerEmail, subject: ownerMail.subject, html: ownerMail.html });
    }
  } catch (err) {
    console.error("[square] owner order notification failed:", err);
  }

  return ref.id;
}
