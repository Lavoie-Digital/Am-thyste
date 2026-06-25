import type { Metadata } from "next";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Formation" };

const MODULES = {
  fr: [
    { t: "La science de la fibre", d: "Comprendre la structure du cheveu et le mécanisme d'action du Hair Botox." },
    { t: "Le protocole en salon", d: "Maîtriser l'application, les temps de pose et la personnalisation par type de cheveu." },
    { t: "Conseil & fidélisation", d: "Recommander le rituel d'entretien à domicile et bâtir une clientèle fidèle." },
  ],
  en: [
    { t: "The science of the fiber", d: "Understand hair structure and the mechanism behind Hair Botox." },
    { t: "The in-salon protocol", d: "Master application, processing times and customization by hair type." },
    { t: "Advice & loyalty", d: "Recommend the at-home care ritual and build a loyal clientele." },
  ],
};

export default async function FormationPage() {
  const locale = await getLocale();
  const modules = MODULES[locale];

  return (
    <>
      <PageHeader
        eyebrow={locale === "fr" ? "Pour les professionnels" : "For professionals"}
        title={locale === "fr" ? "La formation" : "Training"}
        subtitle={
          locale === "fr"
            ? "Valorisez votre expertise. Apprenez à offrir des résultats mesurables et durables avec la gamme Améthyste."
            : "Elevate your expertise. Learn to deliver measurable, lasting results with the Améthyste range."
        }
      />
      <section className="pb-16">
        <Container className="grid gap-12 md:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.t} delay={i * 0.1}>
              <span className="font-serif-lux text-2xl italic text-gold/80">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-display text-xl tracking-wide text-ink">{m.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/55">{m.d}</p>
            </Reveal>
          ))}
        </Container>
      </section>
      <section className="pb-24">
        <Container className="text-center">
          <Reveal>
            <ButtonLink href="/pro" variant="gold" size="lg">
              {locale === "fr" ? "Rejoindre l'espace pro" : "Join the pro space"}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
