import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  const description =
    locale === "fr"
      ? "AMÉTHYSTE est une marque québécoise de soins capillaires professionnels et de produits d'entretien à domicile, au service des professionnels de la coiffure et de leur clientèle."
      : "AMÉTHYSTE is a Québec brand of professional hair care and at-home care products, serving hairdressing professionals and their clients.";
  return {
    title: locale === "fr" ? "À propos" : "About",
    description,
    alternates: { canonical: "/a-propos" },
    openGraph: {
      title: "À propos · Améthyste",
      description,
      url: "/a-propos",
      type: "website",
    },
  };
}

export default async function AProposPage() {
  const { dict, locale } = await getI18n();

  const body =
    locale === "fr"
      ? [
          "AMÉTHYSTE est une marque québécoise née d'une passion pour la beauté et les soins capillaires.",
          "Nous proposons une gamme de soins capillaires professionnels ainsi que des produits d'entretien conçus pour accompagner les routines capillaires à domicile.",
          "Notre mission est d'offrir des produits de qualité répondant aux besoins des professionnels de la coiffure et de leur clientèle.",
        ]
      : [
          "AMÉTHYSTE is a Québec brand born from a passion for beauty and hair care.",
          "We offer a range of professional hair care treatments, along with care products designed to support at-home hair routines.",
          "Our mission is to provide quality products that meet the needs of hairdressing professionals and their clients.",
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
