"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { upsertProduct } from "@/lib/actions/products";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

const textarea = inputClass.replace("h-12", "min-h-24 py-3");

export function ProductEditorForm({ product }: { product: Product | null }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [f, setF] = useState({
    nameFr: product?.name.fr ?? "",
    nameEn: product?.name.en ?? "",
    shortDescFr: product?.shortDesc.fr ?? "",
    shortDescEn: product?.shortDesc.en ?? "",
    descFr: product?.description.fr ?? "",
    descEn: product?.description.en ?? "",
    ritualFr: product?.ritual?.fr ?? "",
    ritualEn: product?.ritual?.en ?? "",
    ingredientsFr: product?.ingredients?.fr ?? "",
    ingredientsEn: product?.ingredients?.en ?? "",
    marketPrice: product ? (product.marketPrice / 100).toString() : "",
    resellerPrice: product ? (product.resellerPrice / 100).toString() : "",
    images: product?.images.join("\n") ?? "",
    sizeLabelFr: product?.sizes[0]?.label.fr ?? "",
    sizeLabelEn: product?.sizes[0]?.label.en ?? "",
    category: product?.category ?? "other",
    sortOrder: product?.sortOrder?.toString() ?? "99",
    active: product?.active ?? true,
  });

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await upsertProduct({
        id: product?.id,
        slug: product?.slug,
        active: f.active,
        nameFr: f.nameFr,
        nameEn: f.nameEn,
        shortDescFr: f.shortDescFr,
        shortDescEn: f.shortDescEn,
        descFr: f.descFr,
        descEn: f.descEn,
        ritualFr: f.ritualFr,
        ritualEn: f.ritualEn,
        ingredientsFr: f.ingredientsFr,
        ingredientsEn: f.ingredientsEn,
        marketPrice: parseFloat(f.marketPrice) || 0,
        resellerPrice: parseFloat(f.resellerPrice) || 0,
        images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
        sizeLabelFr: f.sizeLabelFr,
        sizeLabelEn: f.sizeLabelEn,
        category: f.category,
        sortOrder: parseInt(f.sortOrder) || 99,
      });
      if (!res.ok) throw new Error(res.error);
      router.push("/tableau-de-bord/produits");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message === "not-configured" ? "Firebase non configuré." : dict.auth.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="rounded-2xl glass p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={dict.dashboard.nameFr}><input required value={f.nameFr} onChange={upd("nameFr")} className={inputClass} /></Field>
          <Field label={dict.dashboard.nameEn}><input required value={f.nameEn} onChange={upd("nameEn")} className={inputClass} /></Field>
          <Field label={dict.dashboard.shortDescFr}><input value={f.shortDescFr} onChange={upd("shortDescFr")} className={inputClass} /></Field>
          <Field label={dict.dashboard.shortDescEn}><input value={f.shortDescEn} onChange={upd("shortDescEn")} className={inputClass} /></Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={dict.dashboard.descFr}><textarea value={f.descFr} onChange={upd("descFr")} className={textarea} /></Field>
          <Field label={dict.dashboard.descEn}><textarea value={f.descEn} onChange={upd("descEn")} className={textarea} /></Field>
        </div>
      </div>

      <div className="rounded-2xl glass p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${dict.dashboard.marketPriceLabel}`} hint="ex. 49.99">
            <input type="number" step="0.01" required value={f.marketPrice} onChange={upd("marketPrice")} className={inputClass} />
          </Field>
          <Field label={`${dict.dashboard.resellerPriceLabel}`} hint="ex. 29.99">
            <input type="number" step="0.01" required value={f.resellerPrice} onChange={upd("resellerPrice")} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Format (FR)" hint="ex. 500 g / 17,6 oz"><input value={f.sizeLabelFr} onChange={upd("sizeLabelFr")} className={inputClass} /></Field>
          <Field label="Format (EN)"><input value={f.sizeLabelEn} onChange={upd("sizeLabelEn")} className={inputClass} /></Field>
        </div>
      </div>

      <div className="rounded-2xl glass p-6">
        <Field label={dict.dashboard.imagesLabel} hint="ex. /démo.jpeg ou URL Firebase Storage">
          <textarea value={f.images} onChange={upd("images")} className={textarea} placeholder="/démo.jpeg" />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Catégorie">
            <select value={f.category} onChange={upd("category")} className={inputClass}>
              <option value="mask">mask</option>
              <option value="serum">serum</option>
              <option value="shampoo">shampoo</option>
              <option value="conditioner">conditioner</option>
              <option value="other">other</option>
            </select>
          </Field>
          <Field label="Ordre"><input type="number" value={f.sortOrder} onChange={upd("sortOrder")} className={inputClass} /></Field>
          <label className="flex items-end gap-2 pb-3">
            <input type="checkbox" checked={f.active} onChange={upd("active")} className="h-5 w-5 rounded" />
            <span className="text-sm text-amethyst-100">{dict.dashboard.activeLabel}</span>
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving} size="lg">{saving ? dict.common.saving : dict.common.save}</Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>{dict.common.cancel}</Button>
      </div>
    </form>
  );
}
