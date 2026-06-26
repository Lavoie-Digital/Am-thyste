import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Mark } from "@/components/ui/icons";
import { getI18n } from "@/lib/i18n/server";

export default async function ProLandingPage() {
  const { dict } = await getI18n();

  return (
    <div className="pt-32">
      {/* Hero */}
      <section className="py-16">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-gold">
              <Mark className="h-3 w-3" />
              {dict.pro.badge}
            </span>
            <p className="eyebrow mt-6 text-gold">{dict.pro.title}</p>
            <h1 className="mt-4 heading text-4xl leading-tight sm:text-6xl">{dict.pro.hero}</h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink/65">{dict.pro.heroDesc}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/pro/inscription" variant="gold" size="lg">{dict.pro.join}</ButtonLink>
              <ButtonLink href="/pro/connexion" variant="secondary" size="lg">{dict.nav.login}</ButtonLink>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink/45">
              <Mark className="h-2.5 w-2.5 text-amethyst-500/70" />
              {dict.pro.trust}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="group relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-ink/[0.06]">
              <Image
                src="/carte.jpeg"
                alt="Améthyste"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
