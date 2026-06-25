import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "Politique de confidentialité" };

export default async function PrivacyPage() {
  const locale = await getLocale();
  return (
    <>
      <PageHeader title={locale === "fr" ? "Politique de confidentialité" : "Privacy policy"} />
      <section className="pb-24">
        <Container className="max-w-3xl space-y-4 text-ink/65 leading-relaxed">
          <p>
            {locale === "fr"
              ? "Améthyste respecte votre vie privée. Vos données (nom, courriel, adresse) sont utilisées uniquement pour traiter vos commandes et, le cas échéant, vous tenir informé de nos offres. Elles ne sont jamais revendues."
              : "Améthyste respects your privacy. Your data (name, email, address) is used solely to process your orders and, where applicable, keep you informed of our offers. It is never resold."}
          </p>
          <p>
            {locale === "fr"
              ? "Les paiements sont traités de manière sécurisée par Stripe. Pour toute question, écrivez-nous via la page Contact."
              : "Payments are securely processed by Stripe. For any question, reach us through the Contact page."}
          </p>
        </Container>
      </section>
    </>
  );
}
