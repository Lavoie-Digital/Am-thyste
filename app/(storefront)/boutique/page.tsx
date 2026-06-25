import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getI18n } from "@/lib/i18n/server";
import { verifySession, isApprovedPro } from "@/lib/auth/dal";
import { getProducts } from "@/lib/data/products";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.shop.title, description: dict.shop.subtitle };
}

export default async function BoutiquePage() {
  const { dict } = await getI18n();
  const viewer = await verifySession();
  const products = await getProducts(viewer);
  const pro = isApprovedPro(viewer);

  return (
    <div className="pb-24 pt-32">
      <Container>
        <Reveal className="text-center">
          <p className="eyebrow">{pro ? dict.pro.approvedTitle : dict.brand.subtitle}</p>
          <h1 className="mt-5 heading text-4xl sm:text-6xl">{dict.shop.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-amethyst-200/60">{dict.shop.subtitle}</p>
        </Reveal>

        {products.length === 0 ? (
          <p className="mt-20 text-center text-amethyst-200/60">{dict.shop.empty}</p>
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
