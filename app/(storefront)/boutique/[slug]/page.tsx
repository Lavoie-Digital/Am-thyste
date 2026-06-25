import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { Container } from "@/components/ui/Container";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { verifySession } from "@/lib/auth/dal";
import { getProduct } from "@/lib/data/products";
import { pick } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug, null);
  if (!product) return { title: "Introuvable" };
  return {
    title: pick(product.name, locale),
    description: pick(product.shortDesc, locale),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await getI18n();
  const viewer = await verifySession();
  const product = await getProduct(slug, viewer);
  if (!product) notFound();

  return (
    <div className="pb-24 pt-32">
      <Container>
        <ProductDetail product={product} />
      </Container>
    </div>
  );
}
