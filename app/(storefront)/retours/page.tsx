import Link from "next/link";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const fr = locale === "fr";
  return {
    title: fr ? "Politique de retour et garantie" : "Return and warranty policy",
    description: fr
      ? "Politique de retour Améthyste : 7 jours suivant la réception pour demander un retour, produit non utilisé, et garantie de 6 mois contre les défauts de fabrication."
      : "Améthyste return policy: 7 days from delivery to request a return on unused products, plus a 6-month warranty against manufacturing defects.",
    alternates: { canonical: "/retours" },
  };
}

type Section = { heading: string; body: string[] };

const CONTENT: Record<
  "fr" | "en",
  { intro: string; sections: Section[]; notice: string; contact: string }
> = {
  fr: {
    intro:
      "Si votre achat ne vous convient pas, vous disposez de 7 jours suivant la réception de votre commande pour demander un retour. Le produit doit être non utilisé, non porté et dans son état d'origine, avec ses accessoires et son emballage.",
    sections: [
      {
        heading: "Frais et remboursement",
        body: [
          "Les frais de retour sont à la charge du client. Une fois le produit reçu et inspecté, le remboursement sera effectué si toutes les conditions de retour sont respectées.",
        ],
      },
      {
        heading: "Garantie de 6 mois",
        body: [
          "Nos sacs bénéficient également d'une garantie de 6 mois contre les défauts de fabrication. Cette garantie ne couvre pas l'usure normale, les frottements, les égratignures, les taches ou les dommages causés par l'utilisation ou un entretien inadéquat.",
        ],
      },
      {
        heading: "Achats chez un détaillant",
        body: [
          "Pour tout achat effectué auprès de l'un de nos détaillants, la politique de retour du détaillant s'applique.",
        ],
      },
    ],
    notice:
      "Avant tout retour, veuillez communiquer avec nous afin d'obtenir les instructions de retour.",
    contact: "Nous joindre",
  },
  en: {
    intro:
      "If your purchase does not suit you, you have 7 days from the delivery of your order to request a return. The product must be unused, unworn and in its original condition, with its accessories and packaging.",
    sections: [
      {
        heading: "Fees and refund",
        body: [
          "Return shipping costs are the customer's responsibility. Once the product has been received and inspected, the refund will be issued provided all return conditions are met.",
        ],
      },
      {
        heading: "6-month warranty",
        body: [
          "Our bags also carry a 6-month warranty against manufacturing defects. This warranty does not cover normal wear, rubbing, scratches, stains or damage caused by use or inadequate care.",
        ],
      },
      {
        heading: "Purchases from a retailer",
        body: [
          "For any purchase made from one of our retailers, that retailer's return policy applies.",
        ],
      },
    ],
    notice:
      "Before sending any return, please contact us to obtain the return instructions.",
    contact: "Contact us",
  },
};

export default async function ReturnsPage() {
  const locale = await getLocale();
  const fr = locale === "fr";
  const { intro, sections, notice, contact } = CONTENT[fr ? "fr" : "en"];

  return (
    <>
      <PageHeader
        title={fr ? "Politique de retour et garantie" : "Return and warranty policy"}
      />
      <section className="pb-24">
        <Container className="max-w-3xl space-y-10 text-ink/65 leading-relaxed">
          <p>{intro}</p>
          {sections.map((s) => (
            <div key={s.heading} className="space-y-4">
              <h2 className="heading text-xl text-ink">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ))}
          <div className="border-l-2 border-ink/15 pl-5">
            <p className="font-serif-lux text-lg italic text-ink/75">
              «&nbsp;{notice}&nbsp;»
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block text-xs uppercase tracking-[0.25em] text-ink transition-opacity hover:opacity-60"
            >
              {contact}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
