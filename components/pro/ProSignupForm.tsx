"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createProfile } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";

export function ProSignupForm() {
  const { dict } = useLocale();
  const { signUp, configured } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    businessName: "",
    businessNumber: "",
    phone: "",
    line1: "",
    city: "",
    province: "Québec",
    postalCode: "",
    country: "Canada",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!configured) {
      setError(dict.auth.errorGeneric);
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.displayName);
      const res = await createProfile({
        displayName: form.displayName,
        applyAsPro: true,
        pro: {
          businessName: form.businessName,
          businessNumber: form.businessNumber,
          phone: form.phone,
          line1: form.line1,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      if (!res.ok) throw new Error(res.error);
      router.push("/pro/espace");
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(code.includes("email-already") ? dict.auth.errorEmailInUse : dict.auth.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      {!configured && (
        <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-gold-soft">
          Firebase n&apos;est pas encore configuré. Ajoutez vos clés dans .env.local.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={dict.common.name}>
          <input required value={form.displayName} onChange={set("displayName")} className={inputClass} />
        </Field>
        <Field label={dict.common.phone}>
          <input required value={form.phone} onChange={set("phone")} className={inputClass} />
        </Field>
      </div>
      <Field label={dict.common.email}>
        <input type="email" required value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" />
      </Field>
      <Field label={dict.common.password}>
        <input type="password" required minLength={6} value={form.password} onChange={set("password")} className={inputClass} autoComplete="new-password" />
      </Field>

      <div className="border-t border-amethyst-300/15 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={dict.pro.businessName}>
            <input required value={form.businessName} onChange={set("businessName")} className={inputClass} />
          </Field>
          <Field label={dict.pro.businessNumber} hint={dict.common.optional}>
            <input value={form.businessNumber} onChange={set("businessNumber")} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Adresse">
            <input required value={form.line1} onChange={set("line1")} className={inputClass} placeholder="123 rue Principale" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Ville">
            <input required value={form.city} onChange={set("city")} className={inputClass} />
          </Field>
          <Field label="Province">
            <input required value={form.province} onChange={set("province")} className={inputClass} />
          </Field>
          <Field label="Code postal">
            <input required value={form.postalCode} onChange={set("postalCode")} className={inputClass} />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? dict.common.loading : dict.pro.submitApplication}
      </Button>
      <p className="pt-2 text-center text-sm text-amethyst-200/70">
        {dict.pro.alreadyMember}{" "}
        <Link href="/pro/connexion" className="text-amethyst-200 underline-offset-4 hover:text-white hover:underline">
          {dict.nav.login}
        </Link>
      </p>
    </form>
  );
}
