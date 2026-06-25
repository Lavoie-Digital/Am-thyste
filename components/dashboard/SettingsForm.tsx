"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { updateSettings } from "@/lib/actions/settings";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    freeShippingThreshold: (settings.freeShippingThreshold / 100).toString(),
    flatShippingRate: (settings.flatShippingRate / 100).toString(),
    contactEmail: settings.contactEmail,
    instagram: settings.social?.instagram ?? "",
    facebook: settings.social?.facebook ?? "",
  });

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await updateSettings({
        freeShippingThreshold: parseFloat(f.freeShippingThreshold) || 0,
        flatShippingRate: parseFloat(f.flatShippingRate) || 0,
        contactEmail: f.contactEmail,
        instagram: f.instagram,
        facebook: f.facebook,
      });
      if (!res.ok) throw new Error(res.error);
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message === "not-configured" ? "Firebase non configuré." : dict.auth.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-6">
      <div className="rounded-2xl glass p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={dict.dashboard.freeShippingThreshold} hint="ex. 100"><input type="number" step="0.01" value={f.freeShippingThreshold} onChange={upd("freeShippingThreshold")} className={inputClass} /></Field>
          <Field label={dict.dashboard.flatShippingRate} hint="ex. 15"><input type="number" step="0.01" value={f.flatShippingRate} onChange={upd("flatShippingRate")} className={inputClass} /></Field>
        </div>
        <Field label={dict.dashboard.contactEmail}><input type="email" value={f.contactEmail} onChange={upd("contactEmail")} className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram"><input value={f.instagram} onChange={upd("instagram")} className={inputClass} /></Field>
          <Field label="Facebook"><input value={f.facebook} onChange={upd("facebook")} className={inputClass} /></Field>
        </div>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {saved && <p className="text-sm text-emerald-300">✓ {dict.common.save}</p>}
      <Button type="submit" disabled={saving} size="lg">{saving ? dict.common.saving : dict.common.save}</Button>
    </form>
  );
}
