"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { deleteProduct } from "@/lib/actions/products";
import { formatPrice, pick } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductList({ initial }: { initial: Product[] }) {
  const { dict, locale } = useLocale();
  const [rows, setRows] = useState(initial);
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const remove = (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setBusy(id);
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.ok) setRows((r) => r.filter((p) => p.id !== id));
      setBusy(null);
    });
  };

  return (
    <div className="space-y-3">
      {rows.map((p) => (
        <div key={p.id} className="flex items-center gap-4 rounded-2xl glass p-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-ink/10">
            {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" unoptimized={p.images[0].startsWith("data:")} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-medium text-ink">
              {pick(p.name, locale)}
              {!p.active && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] text-ink/55">inactif</span>}
            </p>
            <p className="text-sm text-ink/55">
              {dict.common.marketPrice}: {formatPrice(p.marketPrice, locale)} · {dict.common.resellerPrice}: {formatPrice(p.resellerPrice, locale)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/tableau-de-bord/produits/${p.id}`} className="rounded-full border border-ink/10 px-4 py-1.5 text-xs text-ink hover:bg-ink/[0.04]">
              {dict.common.edit}
            </Link>
            <button onClick={() => remove(p.id)} disabled={busy === p.id} className="rounded-full border border-red-400/30 px-4 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50">
              {dict.common.delete}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
