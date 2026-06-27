import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Entretien · Le rituel" };

const STEPS = {
  fr: [
    { n: "01", t: "Préparer", d: "Lavez avec le Shampoing Lissant pour purifier la fibre et ouvrir l'écaille en douceur." },
    { n: "02", t: "Transformer", d: "Appliquez le masque mèche par mèche. Laissez poser 20 à 40 minutes." },
    { n: "03", t: "Sceller", d: "Rincez, puis nourrissez avec le Revitalisant Lissant pour verrouiller l'hydratation." },
    { n: "04", t: "Sublimer", d: "Quelques gouttes d'Huile Prestige sur les longueurs pour une brillance miroir et une protection durable." },
  ],
  en: [
    { n: "01", t: "Prepare", d: "Cleanse with the Smoothing Shampoo to purify the fiber and gently open the cuticle." },
    { n: "02", t: "Transform", d: "Apply the Hair Botox mask section by section. Leave on for 20 to 40 minutes." },
    { n: "03", t: "Seal", d: "Rinse, then nourish with the Smoothing Conditioner to lock in hydration." },
    { n: "04", t: "Sublimate", d: "A few drops of Huile Prestige on the lengths for mirror shine and lasting protection." },
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
            ? "Quatre gestes pour prolonger la transformation bien au-delà du salon. La durabilité se cultive."
            : "Four gestures to extend the transformation well beyond the salon. Longevity is cultivated."
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
