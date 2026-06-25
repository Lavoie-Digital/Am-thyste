import "server-only";
import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@amethyste.example";

/** True when a real SendGrid API key is configured. */
export const emailEnabled = Boolean(
  apiKey && apiKey.startsWith("SG.") && !apiKey.includes("placeholder"),
);

let configured = false;

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a transactional email. No-ops (with a log) when SendGrid isn't
 * configured, so the app never crashes on missing keys.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  if (!emailEnabled) {
    console.info(`[email] skipped (no SENDGRID_API_KEY): "${msg.subject}" → ${msg.to}`);
    return;
  }
  try {
    if (!configured) {
      sgMail.setApiKey(apiKey as string);
      configured = true;
    }
    await sgMail.send({
      to: msg.to,
      from: fromEmail,
      subject: msg.subject,
      html: msg.html,
      text: msg.text || msg.html.replace(/<[^>]+>/g, " "),
    });
  } catch (err) {
    // Never let email failures break the core flow (order creation, approval…).
    console.error("[email] send failed:", err);
  }
}
