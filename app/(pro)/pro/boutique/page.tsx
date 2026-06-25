import { redirect } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getI18n } from "@/lib/i18n/server";
import { requireUser, isApprovedPro } from "@/lib/auth/dal";
import { getProducts } from "@/lib/data/products";

export default async function ProBoutiquePage() {
  const { dict } = await getI18n();
  const viewer = await requireUser("/pro/connexion?redirect=/pro/boutique");

  // Only approved pros (and admins) may see reseller pricing.
  if (!isApprovedPro(viewer)) redirect("/pro/espace");

  const products = await getProducts(viewer); // reseller prices included for this viewer

  return (
    <div className="pb-24 pt-32">
      <Container>
        <Reveal className="text-center">
          <p className="eyebrow text-gold/70">{dict.common.resellerPrice}</p>
          <h1 className="mt-5 heading text-4xl sm:text-6xl">{dict.pro.viewCatalog}</h1>
          <p className="mx-auto mt-5 max-w-xl text-amethyst-200/60">{dict.shop.subtitle}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-3 lg:gap-x-10 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
