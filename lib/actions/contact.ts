"use server";

import { z } from "zod";
import { sendEmail } from "../email/sendgrid";
import { contactAckEmail, contactOwnerEmail } from "../email/templates";
import { getOwnerEmail } from "../data/settings";
import { getLocale } from "../i18n/server";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1).max(4000),
});

export async function submitContact(input: z.input<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, email, message } = parsed.data;

  const [ownerEmail, locale] = await Promise.all([getOwnerEmail(), getLocale()]);

  // Notify the owner (reply-to points at the customer so they can answer directly).
  const owner = contactOwnerEmail({ name, email, message });
  await sendEmail({ to: ownerEmail, subject: owner.subject, html: owner.html, replyTo: email });

  // Acknowledge receipt to the customer, with the 48h response window.
  const ack = contactAckEmail(name, locale);
  await sendEmail({ to: email, subject: ack.subject, html: ack.html });

  return { ok: true };
}
