"use server";

import { z } from "zod";
import { sendEmail } from "../email/sendgrid";
import { contactNotificationEmail } from "../email/templates";
import { getSettings } from "../data/settings";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1).max(4000),
});

export async function submitContact(input: z.input<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, email, message } = parsed.data;

  const settings = await getSettings();
  const mail = contactNotificationEmail(`${name} <${email}>`, message);
  await sendEmail({ to: settings.contactEmail, subject: mail.subject, html: mail.html });

  return { ok: true };
}
