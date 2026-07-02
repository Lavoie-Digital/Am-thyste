import "server-only";
import type { Locale, Order, ProProfile } from "../types";
import { formatPrice, pick } from "../utils";

/* Brand palette (mirrors app/globals.css) — inline hex only, for email clients. */
const AMETHYST = "#65338e"; // Améthyste
const AMETHYST_SOFT = "#8d57aa"; // Violet Lumière
const INK = "#0a070c"; // Noir Onyx
const INK_MUTE = "#6f6377";
const IVORY = "#f6eef2"; // Blanc Perlé
const LINE = "#e7d8ea";

/**
 * Premium, email-client-safe shell. Table-based, all styles inline, light
 * ivory canvas with a white card and amethyst accents — matching the site.
 */
function shell(title: string, body: string, opts?: { preheader?: string }): string {
  const preheader = opts?.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${IVORY}">${opts.preheader}</div>`
    : "";
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${IVORY};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
      <!-- Header / wordmark -->
      <tr><td align="center" style="padding:8px 0 28px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:6px;color:${INK};">AMÉTHYSTE</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${AMETHYST};margin-top:6px;">Professional Haircare</div>
      </td></tr>
      <!-- Card -->
      <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:20px;padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="height:4px;background:${AMETHYST};border-radius:20px 20px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:36px 36px 40px;font-family:Georgia,'Times New Roman',serif;">
            <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:${INK};font-weight:normal;">${title}</h1>
            ${body}
          </td></tr>
        </table>
      </td></tr>
      <!-- Footer -->
      <tr><td align="center" style="padding:26px 16px 8px;font-family:Arial,Helvetica,sans-serif;">
        <div style="font-size:11px;letter-spacing:2px;color:${INK_MUTE};text-transform:uppercase;">Améthyste · Fièrement canadien</div>
        <div style="font-size:11px;color:#a89bb0;margin-top:8px;">© Améthyste Hair Products</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#3a3040;">${text}</p>`;

/** A soft amethyst-tinted callout box, used for the 48h delay note. */
const note = (text: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 6px;">
    <tr><td style="background:${IVORY};border:1px solid ${LINE};border-radius:12px;padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${AMETHYST};">${text}</td></tr>
  </table>`;

const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;"><tr>
    <td style="border-radius:999px;background:${AMETHYST};">
      <a href="${href}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${label}</a>
    </td></tr></table>`;

/** A key/value detail row for owner-facing notifications. */
function detailRows(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 6px;border-collapse:collapse;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr>
            <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${INK_MUTE};width:38%;vertical-align:top;">${k}</td>
            <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-family:Georgia,serif;font-size:15px;color:${INK};">${v}</td>
          </tr>`,
      )
      .join("")}
  </table>`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------------ */
/* Transactional                                                       */
/* ------------------------------------------------------------------ */

export function orderConfirmationEmail(order: Order, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: `Confirmation de commande — Améthyste`,
          title: "Merci pour votre commande !",
          intro: "Votre rituel Améthyste est en préparation. Voici le récapitulatif :",
          subtotal: "Sous-total",
          shipping: "Livraison",
          tax: "Taxes (TPS/TVQ)",
          total: "Total",
          free: "Gratuite",
        }
      : {
          subject: `Order confirmation — Améthyste`,
          title: "Thank you for your order!",
          intro: "Your Améthyste ritual is being prepared. Here's your summary:",
          subtotal: "Subtotal",
          shipping: "Shipping",
          tax: "Tax (GST/QST)",
          total: "Total",
          free: "Free",
        };

  const rows = order.lineItems
    .map(
      (li) =>
        `<tr><td style="padding:8px 0;font-family:Georgia,serif;color:#3a3040;">${pick(li.nameSnapshot, locale)} × ${li.quantity}</td>
         <td style="padding:8px 0;text-align:right;font-family:Georgia,serif;color:${INK}">${formatPrice(li.unitAmount * li.quantity, locale)}</td></tr>`,
    )
    .join("");

  const body = `
    ${p(t.intro)}
    <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:8px">${rows}
      <tr><td style="padding-top:14px;border-top:1px solid ${LINE};font-family:Arial,sans-serif;color:${INK_MUTE}">${t.subtotal}</td>
      <td style="padding-top:14px;border-top:1px solid ${LINE};text-align:right;font-family:Georgia,serif;color:#3a3040">${formatPrice(order.subtotal, locale)}</td></tr>
      <tr><td style="font-family:Arial,sans-serif;color:${INK_MUTE}">${t.shipping}</td><td style="text-align:right;font-family:Georgia,serif;color:#3a3040">${order.shipping === 0 ? t.free : formatPrice(order.shipping, locale)}</td></tr>
      ${order.tax > 0 ? `<tr><td style="font-family:Arial,sans-serif;color:${INK_MUTE}">${t.tax}</td><td style="text-align:right;font-family:Georgia,serif;color:#3a3040">${formatPrice(order.tax, locale)}</td></tr>` : ""}
      <tr><td style="padding-top:10px;font-family:Georgia,serif;font-weight:bold;color:${INK}">${t.total}</td>
      <td style="padding-top:10px;text-align:right;font-family:Georgia,serif;font-weight:bold;color:${AMETHYST}">${formatPrice(order.total, locale)}</td></tr>
    </table>`;

  return { subject: t.subject, html: shell(t.title, body, { preheader: t.intro }) };
}

/** Notification to the owner that a new (paid) order just came in. */
export function orderOwnerEmail(order: Order, locale: Locale) {
  const a = order.shippingAddress;
  const itemsHtml = order.lineItems
    .map(
      (li) =>
        `<tr><td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:${INK}">${esc(pick(li.nameSnapshot, locale))} × ${li.quantity}</td>
         <td style="padding:6px 0;text-align:right;font-family:Georgia,serif;font-size:14px;color:${INK}">${formatPrice(li.unitAmount * li.quantity, locale)}</td></tr>`,
    )
    .join("");

  const rows: Array<[string, string]> = [
    ["Courriel client", `<a href="mailto:${esc(order.email)}" style="color:${AMETHYST};text-decoration:none;">${esc(order.email)}</a>`],
    ["Livraison", esc(`${a.name}\n${a.line1}${a.line2 ? `, ${a.line2}` : ""}\n${a.city}, ${a.province} ${a.postalCode}\n${a.country}`).replace(/\n/g, "<br>")],
    ["Sous-total", formatPrice(order.subtotal, locale)],
    ["Livraison", order.shipping === 0 ? "Gratuite" : formatPrice(order.shipping, locale)],
    ["Taxes (TPS/TVQ)", formatPrice(order.tax ?? 0, locale)],
    ["Total", `<strong>${formatPrice(order.total, locale)}</strong>`],
  ];

  const body =
    p("Une nouvelle commande vient d'être payée. Voici le récapitulatif :") +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 14px;border-bottom:1px solid ${LINE};padding-bottom:8px;">${itemsHtml}</table>` +
    detailRows(rows) +
    button("Voir les commandes", `${process.env.NEXT_PUBLIC_SITE_URL || ""}/tableau-de-bord/commandes`);

  return {
    subject: `Nouvelle commande — ${formatPrice(order.total, locale)} · ${order.email}`,
    html: shell("Nouvelle commande", body, { preheader: `${formatPrice(order.total, locale)} · ${order.email}` }),
  };
}

export function welcomeEmail(name: string, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: "Bienvenue chez Améthyste ✨",
          title: `Bienvenue, ${name}`,
          body: "Merci d'avoir rejoint l'univers Améthyste. Préparez-vous à transformer vos cheveux au cœur de la fibre.",
        }
      : {
          subject: "Welcome to Améthyste ✨",
          title: `Welcome, ${name}`,
          body: "Thank you for joining the Améthyste world. Get ready to transform your hair at the core of the fiber.",
        };
  return { subject: t.subject, html: shell(t.title, p(t.body), { preheader: t.body }) };
}

export function proApprovedEmail(name: string, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: "Votre compte professionnel est approuvé 🎉",
          title: `Félicitations, ${name}`,
          body: "Votre accès professionnel Améthyste a été approuvé. Vous bénéficiez désormais des tarifs de revente. Connectez-vous pour découvrir le catalogue pro.",
          cta: "Voir le catalogue pro",
        }
      : {
          subject: "Your professional account is approved 🎉",
          title: `Congratulations, ${name}`,
          body: "Your Améthyste professional access has been approved. You now benefit from reseller pricing. Sign in to explore the pro catalog.",
          cta: "View the pro catalog",
        };
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/pro/boutique`;
  return {
    subject: t.subject,
    html: shell(t.title, p(t.body) + button(t.cta, url), { preheader: t.body }),
  };
}

export function proRejectedEmail(name: string, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: "Mise à jour de votre demande — Améthyste",
          title: `Bonjour ${name}`,
          body: "Après examen, votre demande d'accès professionnel n'a pas été retenue pour le moment. N'hésitez pas à nous contacter pour en discuter.",
        }
      : {
          subject: "Update on your request — Améthyste",
          title: `Hello ${name}`,
          body: "After review, your professional access request was not approved at this time. Feel free to reach out to discuss.",
        };
  return { subject: t.subject, html: shell(t.title, p(t.body), { preheader: t.body }) };
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

/** Acknowledgement sent to the person who submitted the contact form. */
export function contactAckEmail(name: string, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: "Nous avons bien reçu votre message — Améthyste",
          title: `Merci, ${name}`,
          body: "Votre message a bien été reçu par l'équipe Améthyste. Nous vous répondrons personnellement dans les plus brefs délais.",
          note: "⏱ Délai de réponse : sous 48 heures ouvrables.",
        }
      : {
          subject: "We received your message — Améthyste",
          title: `Thank you, ${name}`,
          body: "Your message has reached the Améthyste team. We'll get back to you personally as soon as possible.",
          note: "⏱ Response time: within 48 business hours.",
        };
  return {
    subject: t.subject,
    html: shell(t.title, p(t.body) + note(t.note), { preheader: t.body }),
  };
}

/** Notification to the owner that a new contact message arrived. */
export function contactOwnerEmail(input: { name: string; email: string; message: string }) {
  const body =
    detailRows([
      ["Nom", esc(input.name)],
      ["Courriel", `<a href="mailto:${esc(input.email)}" style="color:${AMETHYST};text-decoration:none;">${esc(input.email)}</a>`],
    ]) +
    `<p style="margin:20px 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${INK_MUTE}">Message</p>` +
    `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:${INK};white-space:pre-wrap;background:${IVORY};border:1px solid ${LINE};border-radius:12px;padding:16px 18px;">${esc(input.message)}</div>`;
  return {
    subject: `Nouveau message de contact — ${input.name}`,
    html: shell("Nouveau message de contact", body, { preheader: `${input.name} · ${input.email}` }),
  };
}

/* ------------------------------------------------------------------ */
/* Pro application                                                     */
/* ------------------------------------------------------------------ */

/** Acknowledgement sent to a new professional applicant. */
export function proApplicationAckEmail(name: string, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: "Demande d'accès professionnel reçue — Améthyste",
          title: `Merci, ${name}`,
          body: "Nous avons bien reçu votre demande d'accès professionnel ainsi que votre diplôme. Notre équipe l'examinera avec attention avant l'approbation de votre compte.",
          note: "⏱ Délai d'approbation : sous 48 heures ouvrables. Vous recevrez un courriel dès que votre compte sera validé.",
        }
      : {
          subject: "Professional access request received — Améthyste",
          title: `Thank you, ${name}`,
          body: "We've received your professional access request along with your diploma. Our team will review it carefully before approving your account.",
          note: "⏱ Approval time: within 48 business hours. You'll receive an email as soon as your account is validated.",
        };
  return {
    subject: t.subject,
    html: shell(t.title, p(t.body) + note(t.note), { preheader: t.body }),
  };
}

/** Notification to the owner that a new pro application arrived. */
export function proApplicationOwnerEmail(input: {
  name: string;
  email: string;
  profile: ProProfile;
}) {
  const a = input.profile.address;
  const rows: Array<[string, string]> = [
    ["Nom", esc(input.name)],
    ["Courriel", `<a href="mailto:${esc(input.email)}" style="color:${AMETHYST};text-decoration:none;">${esc(input.email)}</a>`],
    ["Entreprise / salon", esc(input.profile.businessName)],
    ["Téléphone", esc(input.profile.phone)],
    ["Adresse", esc(`${a.line1}, ${a.city}, ${a.province} ${a.postalCode}, ${a.country}`)],
  ];
  const body =
    p("Une nouvelle demande d'accès professionnel vient d'être soumise. Vérifiez le diplôme, puis approuvez ou refusez depuis l'espace d'administration.") +
    detailRows(rows) +
    (input.profile.diplomaUrl ? button("Voir le diplôme", input.profile.diplomaUrl) : "") +
    button("Gérer les demandes", `${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin`);
  return {
    subject: `Nouvelle demande pro — ${input.profile.businessName || input.name}`,
    html: shell("Nouvelle demande professionnelle", body, {
      preheader: `${input.profile.businessName || input.name} · ${input.email}`,
    }),
  };
}
