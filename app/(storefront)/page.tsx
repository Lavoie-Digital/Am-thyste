import Link from "next/link";
import { AmethystStarsHero } from "@/components/storefront/AmethystStarsHero";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Leaf, Flask, Mark, Heart } from "@/components/ui/icons";
import { getI18n } from "@/lib/i18n/server";
import { verifySession } from "@/lib/auth/dal";
import { getProducts } from "@/lib/data/products";

const FEATURE_ICONS = [Leaf, Flask, Mark, Heart];

export default async function HomePage() {
  const { dict } = await getI18n();
  const h = dict.home;
  const viewer = await verifySession();
  const products = await getProducts(viewer);
  const featured = products.slice(0, 4);

  return (
    <>
      <AmethystStarsHero />

      {/* Feature strip */}
      <section className="border-y border-ink/[0.06] bg-shell/60">
        <Container>
          <div className="grid grid-cols-2 divide-ink/[0.07] py-12 lg:grid-cols-4 lg:divide-x">
            {h.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Mark;
              return (
                <Reveal
                  key={f.t}
                  delay={i * 0.08}
                  className="flex flex-col items-center px-5 py-6 text-center lg:py-2"
                >
                  <Icon className="h-7 w-7 text-amethyst-500" />
                  <h3 className="mt-4 font-display text-sm uppercase tracking-[0.16em] text-ink">{f.t}</h3>
                  <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-ink/55">{f.d}</p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="pb-28 pt-24">
        <Container>
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{h.shopEyebrow}</p>
              <h2 className="mt-4 heading text-3xl sm:text-4xl lg:text-5xl">{h.shopHeading}</h2>
            </div>
            <Link
              href="/boutique"
              className="group/btn inline-flex items-center gap-2 whitespace-nowrap border-b border-ink/20 pb-1 text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors hover:border-ink hover:text-ink"
            >
              {h.shopAll}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
            </Link>
          </Reveal>

          {featured.length === 0 ? (
            <p className="mt-16 text-center text-ink/55">{dict.shop.empty}</p>
          ) : (
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-10">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* CTA panel */}
      <section className="pb-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-ink/8 bg-bone/70 px-8 py-20 sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(101,51,142,0.18), transparent 70%)" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(141,87,170,0.14), transparent 70%)" }}
              />
              <div className="relative max-w-2xl">
                <p className="eyebrow text-amethyst-500">{h.ctaEyebrow}</p>
                <h2 className="mt-5 heading text-3xl sm:text-4xl lg:text-5xl">{h.ctaTitle}</h2>
                <div className="mt-9">
                  <ButtonLink href="/boutique" variant="primary" size="lg">
                    {h.heroCtaMain}
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
