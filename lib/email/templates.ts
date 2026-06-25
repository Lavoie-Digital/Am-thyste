import "server-only";
import type { Locale, Order } from "../types";
import { formatPrice, pick } from "../utils";

const PURPLE = "#7c4d96";
const DARK = "#160f1f";

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:${DARK};font-family:Georgia,serif;color:#eee">
  <div style="max-width:560px;margin:0 auto;padding:40px 28px">
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-family:'Trajan Pro',Georgia,serif;letter-spacing:4px;font-size:24px;color:#fff">AMÉTHYSTE</div>
      <div style="font-size:11px;letter-spacing:3px;color:${PURPLE};text-transform:uppercase;margin-top:4px">Professional Haircare</div>
    </div>
    <div style="background:rgba(124,77,150,0.10);border:1px solid rgba(124,77,150,0.35);border-radius:16px;padding:32px 28px">
      <h1 style="font-size:22px;color:#fff;margin:0 0 16px">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;font-size:11px;color:#8a7c98;margin-top:24px">Améthyste · Fièrement canadien</p>
  </div></body></html>`;
}

export function orderConfirmationEmail(order: Order, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: `Confirmation de commande — Améthyste`,
          title: "Merci pour votre commande !",
          intro: "Votre rituel Améthyste est en préparation. Voici le récapitulatif :",
          subtotal: "Sous-total",
          shipping: "Livraison",
          total: "Total",
          free: "Gratuite",
        }
      : {
          subject: `Order confirmation — Améthyste`,
          title: "Thank you for your order!",
          intro: "Your Améthyste ritual is being prepared. Here's your summary:",
          subtotal: "Subtotal",
          shipping: "Shipping",
          total: "Total",
          free: "Free",
        };

  const rows = order.lineItems
    .map(
      (li) =>
        `<tr><td style="padding:8px 0;color:#ddd">${pick(li.nameSnapshot, locale)} × ${li.quantity}</td>
         <td style="padding:8px 0;text-align:right;color:#fff">${formatPrice(li.unitAmount * li.quantity, locale)}</td></tr>`,
    )
    .join("");

  const body = `
    <p style="color:#cbbfd6;line-height:1.6">${t.intro}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">${rows}
      <tr><td style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.12);color:#aaa">${t.subtotal}</td>
      <td style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.12);text-align:right;color:#ddd">${formatPrice(order.subtotal, locale)}</td></tr>
      <tr><td style="color:#aaa">${t.shipping}</td><td style="text-align:right;color:#ddd">${order.shipping === 0 ? t.free : formatPrice(order.shipping, locale)}</td></tr>
      <tr><td style="padding-top:8px;font-weight:bold;color:#fff">${t.total}</td>
      <td style="padding-top:8px;text-align:right;font-weight:bold;color:${PURPLE}">${formatPrice(order.total, locale)}</td></tr>
    </table>`;

  return { subject: t.subject, html: shell(t.title, body) };
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
  return { subject: t.subject, html: shell(t.title, `<p style="color:#cbbfd6;line-height:1.6">${t.body}</p>`) };
}

export function proApprovedEmail(name: string, locale: Locale) {
  const t =
    locale === "fr"
      ? {
          subject: "Votre compte professionnel est approuvé 🎉",
          title: `Félicitations, ${name}`,
          body: "Votre accès professionnel Améthyste a été approuvé. Vous bénéficiez désormais des tarifs de revente. Connectez-vous pour découvrir le catalogue pro.",
        }
      : {
          subject: "Your professional account is approved 🎉",
          title: `Congratulations, ${name}`,
          body: "Your Améthyste professional access has been approved. You now benefit from reseller pricing. Sign in to explore the pro catalog.",
        };
  return { subject: t.subject, html: shell(t.title, `<p style="color:#cbbfd6;line-height:1.6">${t.body}</p>`) };
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
  return { subject: t.subject, html: shell(t.title, `<p style="color:#cbbfd6;line-height:1.6">${t.body}</p>`) };
}

export function contactNotificationEmail(from: string, message: string) {
  const body = `<p style="color:#cbbfd6"><strong>De :</strong> ${from}</p><p style="color:#ddd;line-height:1.6;white-space:pre-wrap">${message}</p>`;
  return { subject: `Nouveau message de contact — ${from}`, html: shell("Nouveau message", body) };
}
