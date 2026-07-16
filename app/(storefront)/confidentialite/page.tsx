import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const fr = locale === "fr";
  return {
    title: fr ? "Politique de confidentialité" : "Privacy policy",
    description: fr
      ? "Politique de confidentialité d'Améthyste : données collectées, paiements sécurisés par Stripe, cookies strictement nécessaires seulement, aucune revente de données."
      : "Améthyste privacy policy: data we collect, payments secured by Stripe, strictly necessary cookies only, no data resale.",
    alternates: { canonical: "/confidentialite" },
  };
}

type Section = { heading: string; body: string[] };

const CONTENT: Record<"fr" | "en", { intro: string; sections: Section[] }> = {
  fr: {
    intro:
      "Améthyste accorde une grande importance à la protection de vos renseignements personnels. Cette politique explique quelles données nous recueillons, pourquoi, et comment elles sont protégées, conformément à la Loi 25 (Québec).",
    sections: [
      {
        heading: "Renseignements que nous recueillons",
        body: [
          "Lors d'une commande : votre nom, votre adresse courriel, votre adresse de livraison et de facturation. Ces renseignements sont nécessaires pour traiter et expédier votre commande.",
          "Pour un compte professionnel : les informations d'inscription ainsi que les pièces justificatives (diplôme ou attestation) servant uniquement à vérifier votre statut de professionnel.",
        ],
      },
      {
        heading: "Utilisation de vos données",
        body: [
          "Vos données servent uniquement à traiter vos commandes, assurer la livraison, vérifier l'admissibilité des comptes pro et, le cas échéant, répondre à vos demandes. Elles ne sont jamais vendues, louées ni échangées.",
        ],
      },
      {
        heading: "Paiements",
        body: [
          "Les paiements sont traités de façon sécurisée par Stripe. Nous ne stockons jamais vos numéros de carte : ils sont transmis directement à Stripe, qui agit à titre de sous-traitant de paiement.",
        ],
      },
      {
        heading: "Cookies et stockage",
        body: [
          "Le site n'utilise aucun cookie publicitaire ni de suivi. Seuls deux cookies strictement nécessaires sont employés : un cookie de session pour maintenir votre connexion à un compte pro, et un cookie de préférence de langue (français / anglais).",
          "Votre panier n'est pas enregistré : il reste en mémoire le temps de votre visite et se réinitialise lorsque vous rafraîchissez ou quittez la page. Aucun autre renseignement n'est conservé dans votre navigateur.",
        ],
      },
      {
        heading: "Hébergement et fournisseurs",
        body: [
          "Nos services d'authentification et de base de données sont fournis par Firebase (Google). Ces fournisseurs traitent les données strictement pour notre compte et selon nos instructions.",
        ],
      },
      {
        heading: "Vos droits",
        body: [
          "Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos renseignements personnels. Pour exercer ces droits ou pour toute question, écrivez-nous via la page Contact.",
        ],
      },
    ],
  },
  en: {
    intro:
      "Améthyste takes the protection of your personal information seriously. This policy explains what data we collect, why, and how it is protected, in accordance with Quebec's Law 25.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "When you place an order: your name, email address, shipping and billing address. This information is required to process and ship your order.",
          "For a professional account: your registration details and supporting documents (diploma or certificate) used solely to verify your professional status.",
        ],
      },
      {
        heading: "How we use your data",
        body: [
          "Your data is used only to process your orders, arrange delivery, verify pro-account eligibility and, where applicable, respond to your requests. It is never sold, rented or traded.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "Payments are securely processed by Stripe. We never store your card numbers: they are sent directly to Stripe, which acts as our payment processor.",
        ],
      },
      {
        heading: "Cookies and storage",
        body: [
          "The site uses no advertising or tracking cookies. Only two strictly necessary cookies are used: a session cookie to keep you signed in to a pro account, and a language-preference cookie (French / English).",
          "Your cart is not saved: it stays in memory for the duration of your visit and resets when you refresh or leave the page. No other information is stored in your browser.",
        ],
      },
      {
        heading: "Hosting and providers",
        body: [
          "Our authentication and database services are provided by Firebase (Google). These providers process data strictly on our behalf and under our instructions.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access to, correction of, or deletion of your personal information at any time. To exercise these rights or for any question, reach us through the Contact page.",
        ],
      },
    ],
  },
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const fr = locale === "fr";
  const { intro, sections } = CONTENT[fr ? "fr" : "en"];

  return (
    <>
      <PageHeader title={fr ? "Politique de confidentialité" : "Privacy policy"} />
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
        </Container>
      </section>
    </>
  );
}
