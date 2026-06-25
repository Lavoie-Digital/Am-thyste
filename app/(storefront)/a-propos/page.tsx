import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "À propos" };

export default async function AProposPage() {
  const { dict, locale } = await getI18n();

  const body =
    locale === "fr"
      ? [
          "Née à Rimouski, Améthyste est portée par une conviction : prendre soin de ses cheveux devrait être un véritable rituel, pas une simple routine.",
          "Notre gamme Hair Botox agit au cœur de la fibre. Enrichie de kératine et d'extrait de bambou, elle répare, lisse et sublime — en respectant l'intégrité du cheveu.",
          "Des résultats visibles, durables, et un soin pensé autant pour la maison que pour le salon. C'est la promesse Améthyste.",
        ]
      : [
          "Born in Rimouski, Améthyste is driven by one conviction: caring for your hair should be a true ritual, not a mere routine.",
          "Our Hair Botox range works at the core of the fiber. Enriched with keratin and bamboo extract, it repairs, smooths and sublimates — respecting the hair's integrity.",
          "Visible, lasting results, and care designed for home and salon alike. That is the Améthyste promise.",
        ];

  return (
    <>
      <PageHeader
        eyebrow={dict.brand.subtitle}
        title={locale === "fr" ? "L'univers Améthyste" : "The Améthyste world"}
      />
      <section className="pb-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl ring-1 ring-ink/10">
              <Image src="/présentation.jpeg" alt="Améthyste" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-script text-4xl text-ink/70">Améthyste</p>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/70">
              {body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-8 font-serif-lux text-xl italic text-ink/70">« {dict.brand.tagline} »</p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
