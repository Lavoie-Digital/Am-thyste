import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { getLocale } from "@/lib/i18n/server";
import { getSettings } from "@/lib/data/settings";
import { formatAmount } from "@/lib/utils";

export async function generateMetadata() {
  const locale = await getLocale();
  const fr = locale === "fr";
  return {
    title: fr ? "Conditions d'utilisation" : "Terms of use",
    description: fr
      ? "Conditions d'utilisation de la boutique Améthyste : prix en dollars canadiens, livraison et accès aux tarifs professionnels."
      : "Améthyste shop terms of use: prices in Canadian dollars, shipping and professional pricing access.",
    alternates: { canonical: "/conditions" },
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const settings = await getSettings();
  const seuil = formatAmount(settings.freeShippingThreshold, locale);
  return (
    <>
      <PageHeader title={locale === "fr" ? "Conditions d'utilisation" : "Terms of use"} />
      <section className="pb-24">
        <Container className="max-w-3xl space-y-4 text-ink/65 leading-relaxed">
          <p>
            {locale === "fr"
              ? `En utilisant ce site, vous acceptez nos conditions. Les prix sont en dollars canadiens. La livraison est gratuite pour toute commande de ${seuil} et plus.`
              : `By using this site, you agree to our terms. Prices are in Canadian dollars. Shipping is free for orders of ${seuil} or more.`}
          </p>
          <p>
            {locale === "fr"
              ? "L'accès aux tarifs professionnels est réservé aux comptes pro approuvés par Améthyste. Toute demande est soumise à validation."
              : "Access to professional pricing is reserved for pro accounts approved by Améthyste. Each request is subject to validation."}
          </p>
        </Container>
      </section>
    </>
  );
}
