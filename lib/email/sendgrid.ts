import "server-only";
import sgMail from "@sendgrid/mail";
import { normalizeRecipients } from "./recipients";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@amethyste.example";

/** True when a real SendGrid API key is configured. */
export const emailEnabled = Boolean(
  apiKey && apiKey.startsWith("SG.") && !apiKey.includes("placeholder"),
);

let configured = false;

export interface EmailMessage {
  /** One address, or several (owner notices go to every staff recipient). */
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Where replies should go — e.g. the customer's address on an owner notice. */
  replyTo?: string;
}

/**
 * Sends a transactional email. No-ops (with a log) when SendGrid isn't
 * configured, so the app never crashes on missing keys.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  // A single blank/duplicated address in the list would make SendGrid reject the
  // whole message, so normalize before anything else.
  const recipients = normalizeRecipients(msg.to);
  if (recipients.length === 0) {
    console.warn(`[email] skipped (no recipient): "${msg.subject}"`);
    return;
  }
  if (!emailEnabled) {
    console.info(
      `[email] skipped (no SENDGRID_API_KEY): "${msg.subject}" → ${recipients.join(", ")}`,
    );
    return;
  }
  try {
    if (!configured) {
      sgMail.setApiKey(apiKey as string);
      configured = true;
    }
    await sgMail.send({
      to: recipients,
      from: fromEmail,
      subject: msg.subject,
      html: msg.html,
      text: msg.text || msg.html.replace(/<[^>]+>/g, " "),
      ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
    });
  } catch (err) {
    // Never let email failures break the core flow (order creation, approval…).
    console.error("[email] send failed:", err);
  }
}
