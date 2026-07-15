import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { verifySession, isApprovedPro } from "@/lib/auth/dal";
import { getProducts } from "@/lib/data/products";
import { itemListJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.shop.title,
    description: dict.shop.subtitle,
    alternates: { canonical: "/boutique" },
    openGraph: {
      title: `${dict.shop.title} · Améthyste`,
      description: dict.shop.subtitle,
      url: "/boutique",
      type: "website",
    },
  };
}

export default async function BoutiquePage() {
  const { dict } = await getI18n();
  const locale = await getLocale();
  const viewer = await verifySession();
  const products = await getProducts(viewer);
  const pro = isApprovedPro(viewer);

  const breadcrumb = breadcrumbJsonLd([
    { name: locale === "fr" ? "Accueil" : "Home", path: "/" },
    { name: dict.shop.title, path: "/boutique" },
  ]);

  return (
    <div className="pb-24 pt-32">
      <JsonLd data={[itemListJsonLd(products, locale), breadcrumb]} />
      <Container>
        <Reveal className="text-center">
          <p className="eyebrow">{pro ? dict.pro.approvedTitle : dict.brand.subtitle}</p>
          <h1 className="mt-5 heading text-4xl sm:text-6xl">{dict.shop.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-ink/55">{dict.shop.subtitle}</p>
        </Reveal>

        {products.length === 0 ? (
          <p className="mt-20 text-center text-ink/55">{dict.shop.empty}</p>
        ) : (
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-3 lg:gap-x-10 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
