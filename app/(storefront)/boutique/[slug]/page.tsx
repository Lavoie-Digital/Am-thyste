import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { verifySession } from "@/lib/auth/dal";
import { getProduct } from "@/lib/data/products";
import { pick } from "@/lib/utils";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug, null);
  if (!product) return { title: locale === "fr" ? "Introuvable" : "Not found" };

  const name = pick(product.name, locale);
  const description = pick(product.shortDesc, locale);
  const path = `/boutique/${product.slug}`;

  return {
    title: name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${name} · Améthyste`,
      description,
      url: path,
      type: "website",
      images: product.images.slice(0, 1),
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} · Améthyste`,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  await getI18n();
  const viewer = await verifySession();
  const product = await getProduct(slug, viewer);
  if (!product) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: locale === "fr" ? "Accueil" : "Home", path: "/" },
    { name: locale === "fr" ? "Boutique" : "Shop", path: "/boutique" },
    { name: pick(product.name, locale), path: `/boutique/${product.slug}` },
  ]);

  return (
    <div className="pb-24 pt-32">
      <JsonLd data={[productJsonLd(product, locale), breadcrumb]} />
      <Container>
        <ProductDetail product={product} />
      </Container>
    </div>
  );
}
