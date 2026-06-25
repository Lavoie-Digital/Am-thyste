import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";

export default async function ProLandingPage() {
  const { dict } = await getI18n();

  const perks = dict.home.benefits; // reuse the three benefits as trust signals

  return (
    <div className="pt-32">
      {/* Hero */}
      <section className="py-16">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-gold/70">{dict.pro.title}</p>
            <h1 className="mt-5 heading text-4xl leading-tight sm:text-6xl">{dict.pro.hero}</h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-amethyst-200/70">{dict.pro.heroDesc}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/pro/inscription" variant="gold" size="lg">{dict.pro.join}</ButtonLink>
              <ButtonLink href="/pro/connexion" variant="secondary" size="lg">{dict.nav.login}</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/présentation.jpeg" alt="Améthyste" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Perks — numbered, editorial */}
      <section className="border-t border-amethyst-300/12 py-20">
        <Container className="grid gap-12 md:grid-cols-3">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <span className="font-serif-lux text-2xl italic text-gold/60">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-display text-xl tracking-wide text-ivory">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-amethyst-200/60">{p.desc}</p>
            </Reveal>
          ))}
        </Container>
      </section>
    </div>
  );
}
