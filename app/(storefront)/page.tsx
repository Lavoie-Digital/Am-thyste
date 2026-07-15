import Link from "next/link";
import Image from "next/image";
import { AmethystStarsHero } from "@/components/storefront/AmethystStarsHero";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Leaf, Flask, Mark, Heart } from "@/components/ui/icons";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { verifySession } from "@/lib/auth/dal";
import { getProducts } from "@/lib/data/products";
import { getPartners } from "@/lib/data/partners";
import { pick } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo/jsonld";

const FEATURE_ICONS = [Leaf, Flask, Mark, Heart];

/** Visible FAQ content, mirrored into FAQPage JSON-LD for answer engines. */
const FAQ: Record<"fr" | "en", { eyebrow: string; heading: string; items: Array<{ q: string; a: string }> }> = {
  fr: {
    eyebrow: "Questions fréquentes",
    heading: "Tout savoir sur le rituel",
    items: [
      {
        q: "Qu'est-ce que le Hair Botox d'Améthyste ?",
        a: "Le Hair Botox Améthyste est un masque capillaire reconstructeur qui agit au cœur de la fibre. Enrichi de kératine et d'extrait de bambou, il répare les cheveux en profondeur, discipline les frisottis et ravive la brillance dès la première application.",
      },
      {
        q: "Pour quels types de cheveux le Hair Botox est-il conçu ?",
        a: "Il convient aux cheveux fins, ondulés, abîmés ou frisés. C'est un soin haut de gamme pensé pour réparer, lisser et sublimer tout en respectant l'intégrité du cheveu.",
      },
      {
        q: "Comment appliquer le soin Hair Botox ?",
        a: "Appliquez sur cheveux propres et essorés, mèche par mèche. Laissez poser de 20 à 40 minutes, puis rincez abondamment. Pour des résultats durables, utilisez le rituel une fois par semaine.",
      },
      {
        q: "Puis-je utiliser Améthyste à la maison ou seulement en salon ?",
        a: "Les soins Améthyste sont pensés autant pour la maison que pour le salon. Vous obtenez des résultats professionnels chez vous, et les coiffeurs peuvent l'intégrer à leurs services.",
      },
      {
        q: "Où acheter les produits Améthyste ?",
        a: "Commandez directement en ligne sur notre boutique, ou retrouvez Améthyste chez notre distributeur autorisé Salon Centric et au salon certifié Bella Extensions.",
      },
      {
        q: "Quels sont les frais de livraison ?",
        a: "Nous livrons partout au Québec. La livraison est gratuite pour toute commande de 100 $ CAD et plus.",
      },
    ],
  },
  en: {
    eyebrow: "Frequently asked questions",
    heading: "Everything about the ritual",
    items: [
      {
        q: "What is Améthyste Hair Botox?",
        a: "Améthyste Hair Botox is a rebuilding hair mask that works at the core of the fiber. Enriched with keratin and bamboo extract, it repairs hair deeply, tames frizz and revives shine from the very first application.",
      },
      {
        q: "Which hair types is Hair Botox designed for?",
        a: "It suits fine, wavy, damaged or frizzy hair. It is a premium treatment made to repair, smooth and sublimate while respecting the hair's integrity.",
      },
      {
        q: "How do I apply the Hair Botox treatment?",
        a: "Apply to clean, towel-dried hair, section by section. Leave on for 20 to 40 minutes, then rinse thoroughly. For lasting results, use the ritual once a week.",
      },
      {
        q: "Can I use Améthyste at home or only in a salon?",
        a: "Améthyste treatments are designed for both home and salon. You get professional results at home, and hairdressers can add it to their services.",
      },
      {
        q: "Where can I buy Améthyste products?",
        a: "Order directly online from our shop, or find Améthyste at our authorized distributor Salon Centric and at the certified salon Bella Extensions.",
      },
      {
        q: "What are the shipping fees?",
        a: "We ship across Québec. Shipping is free on every order of $100 CAD or more.",
      },
    ],
  },
};

export default async function HomePage() {
  const { dict } = await getI18n();
  const locale = await getLocale();
  const h = dict.home;
  const faq = FAQ[locale];
  const viewer = await verifySession();
  const products = await getProducts(viewer);
  const featured = products.slice(0, 4);
  const partners = await getPartners();

  return (
    <>
      <JsonLd data={faqJsonLd(faq.items)} />
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

      {/* Partners — managed from the admin, rendered from the database */}
      {partners.length > 0 && (
        <section className="border-y border-ink/[0.06] bg-shell/60">
          <Container>
            <div className="py-16">
              <Reveal className="mx-auto max-w-2xl text-center">
                <p className="eyebrow text-amethyst-500">{h.partnersEyebrow}</p>
                <h2 className="mt-4 heading text-2xl sm:text-3xl">{h.partnersTitle}</h2>
              </Reveal>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8">
                {partners.map((p, i) => {
                  const role = pick(p.role, locale);
                  const desc = pick(p.desc, locale);
                  const cta = pick(p.cta, locale);
                  return (
                    <Reveal key={p.id} delay={i * 0.1}>
                      <Link
                        href={p.href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={p.name}
                        className="group/pt flex h-full flex-col items-center gap-6 rounded-3xl border border-ink/8 bg-bone/70 px-8 py-10 text-center transition-all duration-500 hover:-translate-y-1 hover:border-ink/15 hover:shadow-lg"
                      >
                        {p.logo && (
                          <span className="flex h-24 items-center justify-center">
                            <Image
                              src={p.logo}
                              alt={p.name}
                              width={240}
                              height={80}
                              className="h-auto max-h-20 w-auto max-w-[200px] object-contain"
                              unoptimized={p.logo.startsWith("data:")}
                            />
                          </span>
                        )}
                        <div>
                          {role && (
                            <p className="font-display text-xs uppercase tracking-[0.16em] text-amethyst-500">{role}</p>
                          )}
                          {desc && <p className="mt-2 text-sm leading-relaxed text-ink/55">{desc}</p>}
                        </div>
                        {cta && (
                          <span className="mt-auto inline-flex items-center gap-2 border-b border-ink/20 pb-1 text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors group-hover/pt:border-ink group-hover/pt:text-ink">
                            {cta}
                            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/pt:translate-x-1" />
                          </span>
                        )}
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )}

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

      {/* FAQ — answer-engine (AEO) content, mirrored in FAQPage JSON-LD */}
      <section className="border-t border-ink/[0.06] pb-24 pt-20">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-amethyst-500">{faq.eyebrow}</p>
            <h2 className="mt-4 heading text-3xl sm:text-4xl">{faq.heading}</h2>
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl divide-y divide-ink/[0.08]">
            {faq.items.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.05}>
                <details className="group py-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                    <h3 className="font-display text-lg text-ink">{item.q}</h3>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 rotate-90 text-amethyst-500 transition-transform duration-300 group-open:rotate-[270deg]" />
                  </summary>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/60">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
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
