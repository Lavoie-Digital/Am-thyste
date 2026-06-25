import Image from "next/image";
import { AmethystStarsHero } from "@/components/storefront/AmethystStarsHero";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Divider } from "@/components/ui/icons";
import { getI18n } from "@/lib/i18n/server";
import { verifySession } from "@/lib/auth/dal";
import { getProducts } from "@/lib/data/products";

export default async function HomePage() {
  const { dict } = await getI18n();
  const viewer = await verifySession();
  const products = await getProducts(viewer);
  const featured = products.slice(0, 4);

  return (
    <>
      <AmethystStarsHero />

      {/* Marquee-quiet shipping line */}
      <div className="border-y border-amethyst-300/12 py-3.5 text-center">
        <span className="eyebrow">{dict.home.freeShipping}</span>
      </div>

      {/* Featured products */}
      <section className="py-28">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <Divider className="mb-7" />
            <p className="eyebrow">{dict.brand.subtitle}</p>
            <h2 className="mt-5 heading text-4xl sm:text-5xl">{dict.home.featured}</h2>
            <p className="mt-5 text-amethyst-200/60">{dict.home.featuredSub}</p>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-10">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits — editorial, numbered, hairline-separated */}
      <section className="border-y border-amethyst-300/12 py-28">
        <Container>
          <Reveal className="text-center">
            <h2 className="heading text-3xl sm:text-4xl">{dict.home.benefitsTitle}</h2>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden md:grid-cols-3">
            {dict.home.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.12} className="md:px-10">
                <div className="flex flex-col items-start border-amethyst-300/12 py-2 md:items-center md:text-center">
                  <span className="font-serif-lux text-2xl italic text-gold/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-xl tracking-wide text-ivory">{b.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-amethyst-200/60">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Ritual — editorial split */}
      <section className="py-28">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src="/femme.jpeg" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.12} className="lg:pl-6">
              <p className="eyebrow">{dict.home.ritualBadge}</p>
              <h2 className="mt-5 heading text-4xl sm:text-5xl">{dict.home.ritualTitle}</h2>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-amethyst-200/70">{dict.home.ritualDesc}</p>
              <div className="mt-9">
                <ButtonLink href="/entretien" variant="secondary" size="lg">
                  {dict.nav.entretien}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Pro invitation */}
      <section className="border-t border-amethyst-300/12 py-28">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold/70">{dict.pro.title}</p>
            <h2 className="mt-5 heading text-3xl sm:text-4xl">{dict.home.proTitle}</h2>
            <p className="mx-auto mt-5 max-w-lg text-amethyst-200/60">{dict.home.proDesc}</p>
            <div className="mt-9">
              <ButtonLink href="/pro" variant="gold" size="lg">
                {dict.home.proCta}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
