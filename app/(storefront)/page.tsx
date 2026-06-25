import { AmethystStarsHero } from "@/components/storefront/AmethystStarsHero";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Divider, ArrowRight } from "@/components/ui/icons";
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

      {/* Featured products */}
      <section className="pb-28 pt-20">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <Divider className="mb-7" />
            <p className="eyebrow">{dict.brand.subtitle}</p>
            <h2 className="mt-5 heading text-4xl sm:text-5xl">{dict.home.featured}</h2>
            <p className="mt-5 text-ink/55">{dict.home.featuredSub}</p>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-10">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          <Reveal className="mt-16 flex justify-center">
            <ButtonLink href="/boutique" variant="secondary" size="lg">
              {dict.common.shopNow}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* Pro invitation — designed panel with a soft amethyst bloom */}
      <section className="pb-4 pt-4">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-ink/8 bg-bone/60 px-8 py-20 text-center sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(131,109,146,0.14), transparent 70%)" }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(156,124,67,0.10), transparent 70%)" }}
              />
              <div className="relative mx-auto max-w-2xl">
                <p className="eyebrow text-gold">{dict.pro.title}</p>
                <h2 className="mt-5 heading text-3xl sm:text-4xl">{dict.home.proTitle}</h2>
                <p className="mx-auto mt-5 max-w-lg text-ink/60">{dict.home.proDesc}</p>
                <div className="mt-9">
                  <ButtonLink href="/pro" variant="gold" size="lg">
                    {dict.home.proCta}
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
