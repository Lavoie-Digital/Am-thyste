"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { upsertPartner, deletePartner } from "@/lib/actions/partners";
import { ImageDropzone } from "@/components/dashboard/ImageDropzone";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { pick } from "@/lib/utils";
import type { Partner } from "@/lib/types";

type Draft = {
  id?: string;
  name: string;
  logo: string;
  href: string;
  roleFr: string;
  roleEn: string;
  descFr: string;
  descEn: string;
  ctaFr: string;
  ctaEn: string;
  active: boolean;
  sortOrder: number;
};

function toDraft(p?: Partner, nextOrder = 99): Draft {
  return {
    id: p?.id,
    name: p?.name ?? "",
    logo: p?.logo ?? "",
    href: p?.href ?? "",
    roleFr: p?.role.fr ?? "",
    roleEn: p?.role.en ?? "",
    descFr: p?.desc.fr ?? "",
    descEn: p?.desc.en ?? "",
    ctaFr: p?.cta.fr ?? "",
    ctaEn: p?.cta.en ?? "",
    active: p?.active ?? true,
    sortOrder: p?.sortOrder ?? nextOrder,
  };
}

export function PartnerManager({ initial }: { initial: Partner[] }) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sortOrder)) + 1 : 1;

  const openNew = () => {
    setError("");
    setDraft(toDraft(undefined, nextOrder));
  };
  const openEdit = (p: Partner) => {
    setError("");
    setDraft(toDraft(p));
  };

  const upd =
    (k: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((d) => (d ? { ...d, [k]: e.target.value } : d));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setError("");
    setSaving(true);
    try {
      const res = await upsertPartner({
        id: draft.id,
        name: draft.name,
        logo: draft.logo,
        href: draft.href,
        roleFr: draft.roleFr,
        roleEn: draft.roleEn,
        descFr: draft.descFr,
        descEn: draft.descEn,
        ctaFr: draft.ctaFr,
        ctaEn: draft.ctaEn,
        active: draft.active,
        sortOrder: Number(draft.sortOrder) || nextOrder,
      });
      if (!res.ok) throw new Error(res.error);

      const saved: Partner = {
        id: res.id!,
        name: draft.name,
        logo: draft.logo,
        href: draft.href,
        role: { fr: draft.roleFr, en: draft.roleEn },
        desc: { fr: draft.descFr, en: draft.descEn },
        cta: { fr: draft.ctaFr, en: draft.ctaEn },
        active: draft.active,
        sortOrder: Number(draft.sortOrder) || nextOrder,
        createdAt: 0,
        updatedAt: 0,
      };
      setRows((r) => {
        const without = r.filter((p) => p.id !== saved.id);
        return [...without, saved].sort((a, b) => a.sortOrder - b.sortOrder);
      });
      setDraft(null);
      router.refresh();
    } catch (err: unknown) {
      setError(
        (err as Error).message === "not-configured"
          ? "Firebase non configuré."
          : dict.auth.errorGeneric,
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    setBusy(id);
    const res = await deletePartner(id);
    if (res.ok) setRows((r) => r.filter((p) => p.id !== id));
    setBusy(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Existing partners */}
      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl glass p-6 text-sm text-ink/55">
            Aucun partenaire pour le moment.
          </p>
        )}
        {rows.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl glass p-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-ink/10">
              {p.logo && (
                <Image
                  src={p.logo}
                  alt={p.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                  unoptimized={p.logo.startsWith("data:")}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium text-ink">
                {p.name}
                {!p.active && (
                  <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] text-ink/55">
                    inactif
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-ink/55">{pick(p.role, locale)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(p)}
                className="rounded-full border border-ink/10 px-4 py-1.5 text-xs text-ink hover:bg-ink/[0.04]"
              >
                {dict.common.edit}
              </button>
              <button
                onClick={() => remove(p.id)}
                disabled={busy === p.id}
                className="rounded-full border border-red-400/30 px-4 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              >
                {dict.common.delete}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!draft && (
        <Button type="button" onClick={openNew} size="lg">
          {dict.dashboard.newPartner}
        </Button>
      )}

      {/* Editor */}
      {draft && (
        <form onSubmit={save} className="max-w-2xl space-y-6 rounded-2xl glass p-6">
          <h2 className="font-display text-xl text-ink">
            {draft.id ? dict.dashboard.editPartner : dict.dashboard.newPartner}
          </h2>

          <Field label={dict.dashboard.partnerName}>
            <input value={draft.name} onChange={upd("name")} className={inputClass} required />
          </Field>

          <Field label={dict.dashboard.partnerLink} hint="https://…">
            <input
              type="url"
              value={draft.href}
              onChange={upd("href")}
              className={inputClass}
              placeholder="https://exemple.com"
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-ink-mute">
              {dict.dashboard.partnerLogo}
            </span>
            <ImageDropzone
              value={draft.logo ? [draft.logo] : []}
              onChange={(imgs) =>
                setDraft((d) => (d ? { ...d, logo: imgs.length ? imgs[imgs.length - 1] : "" } : d))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${dict.dashboard.partnerRole} (FR)`}>
              <input value={draft.roleFr} onChange={upd("roleFr")} className={inputClass} />
            </Field>
            <Field label={`${dict.dashboard.partnerRole} (EN)`}>
              <input value={draft.roleEn} onChange={upd("roleEn")} className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${dict.dashboard.partnerDesc} (FR)`}>
              <textarea
                value={draft.descFr}
                onChange={upd("descFr")}
                rows={2}
                className={`${inputClass} h-auto py-2.5`}
              />
            </Field>
            <Field label={`${dict.dashboard.partnerDesc} (EN)`}>
              <textarea
                value={draft.descEn}
                onChange={upd("descEn")}
                rows={2}
                className={`${inputClass} h-auto py-2.5`}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${dict.dashboard.partnerCta} (FR)`}>
              <input value={draft.ctaFr} onChange={upd("ctaFr")} className={inputClass} />
            </Field>
            <Field label={`${dict.dashboard.partnerCta} (EN)`}>
              <input value={draft.ctaEn} onChange={upd("ctaEn")} className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={dict.dashboard.partnerOrder} hint="1, 2, 3…">
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, sortOrder: Number(e.target.value) } : d))
                }
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, active: e.target.checked } : d))
                }
                className="h-5 w-5 rounded border-ink/20 text-amethyst-500"
              />
              <span className="text-sm text-ink">{dict.dashboard.partnerActive}</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} size="lg">
              {saving ? dict.common.saving : dict.common.save}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              {dict.common.cancel}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
