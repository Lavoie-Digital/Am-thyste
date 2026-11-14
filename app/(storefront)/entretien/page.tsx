import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const fr = locale === "fr";
  const description = fr
    ? "Le rituel Améthyste en quatre gestes : préparer, traiter en salon, sceller, sublimer. Comment entretenir vos cheveux à la maison après un traitement Hair Botox."
    : "The Améthyste ritual in four steps: prepare, treat in the salon, seal, sublimate. How to care for your hair at home after a Hair Botox treatment.";
  return {
    title: fr ? "Entretien · Le rituel" : "Care · The ritual",
    description,
    alternates: { canonical: "/entretien" },
    openGraph: {
      title: fr ? "L'entretien · Améthyste" : "The care ritual · Améthyste",
      description,
      url: "/entretien",
      type: "website",
    },
  };
}

const STEPS = {
  fr: [
    { n: "01", t: "Préparer", d: "Lavez avec le Shampoing Lissant pour nettoyer les cheveux en douceur." },
    { n: "02", t: "Traiter en salon", d: "Le traitement Hair Botox, à usage professionnel seulement, est appliqué en salon par votre coiffeuse ou coiffeur." },
    { n: "03", t: "Sceller", d: "Rincez, puis nourrissez avec le Revitalisant Lissant pour sceller l'hydratation." },
    { n: "04", t: "Sublimer", d: "Quelques gouttes d'Huile Prestige sur les longueurs pour plus de brillance et de douceur." },
  ],
  en: [
    { n: "01", t: "Prepare", d: "Cleanse with the Smoothing Shampoo to gently wash the hair." },
    { n: "02", t: "Treat in the salon", d: "Hair Botox, for professional use only, is applied in the salon by your hairdresser." },
    { n: "03", t: "Seal", d: "Rinse, then nourish with the Smoothing Conditioner to lock in hydration." },
    { n: "04", t: "Sublimate", d: "A few drops of Huile Prestige on the lengths for extra shine and softness." },
  ],
};

export default async function EntretienPage() {
  const locale = await getLocale();
  const steps = STEPS[locale];

  return (
    <>
      <PageHeader
        eyebrow={locale === "fr" ? "Le rituel Améthyste" : "The Améthyste ritual"}
        title={locale === "fr" ? "L'entretien" : "The care ritual"}
        subtitle={
          locale === "fr"
            ? "Quatre gestes pour entretenir vos cheveux entre deux visites au salon."
            : "Four gestures to care for your hair between salon visits."
        }
      />
      <section className="pb-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-ink/10">
                <Image src="/shampoing.jpeg" alt="Rituel" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </Reveal>
            <div className="space-y-6">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className="flex gap-5 rounded-2xl glass p-6">
                    <span className="font-display text-3xl text-gold">{s.n}</span>
                    <div>
                      <h3 className="font-display text-xl tracking-wide text-ink">{s.t}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
