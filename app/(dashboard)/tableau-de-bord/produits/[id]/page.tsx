import { notFound } from "next/navigation";
import { ProductEditorForm } from "@/components/dashboard/ProductEditorForm";
import { getI18n } from "@/lib/i18n/server";
import { getProductByIdRaw } from "@/lib/data/products";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { dict } = await getI18n();
  const isNew = id === "new";
  const product = isNew ? null : await getProductByIdRaw(id);
  if (!isNew && !product) notFound();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-ink">
          {isNew ? dict.dashboard.newProduct : dict.dashboard.editProduct}
        </h1>
      </header>
      <ProductEditorForm product={product} />
    </div>
  );
}
