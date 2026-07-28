"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteUser, type User as FirebaseUser } from "firebase/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createProfile } from "@/lib/actions/auth";
import { getClientStorage, getClientAuth } from "@/lib/firebase/client";
import { Field, inputClass } from "@/components/auth/AuthShell";
import { DiplomaDropzone } from "@/components/pro/DiplomaDropzone";
import { Button } from "@/components/ui/Button";

export function ProSignupForm() {
  const { dict } = useLocale();
  const { signUp, signOut, configured } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [diploma, setDiploma] = useState<File | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    businessName: "",
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
    if (!diploma) {
      setError(dict.pro.diplomaRequired);
      return;
    }
    setLoading(true);
    let createdUser: FirebaseUser | null = null;
    let profileCreated = false;
    try {
      createdUser = await signUp(form.email, form.password, form.displayName);

      // Upload the diploma now that the account (and Storage auth) exists.
      const storage = getClientStorage();
      const uid = getClientAuth()?.currentUser?.uid;
      if (!storage || !uid) throw new Error("not-configured");
      const ext = diploma.type === "application/pdf" ? "pdf" : (diploma.name.split(".").pop() || "jpg");
      const dest = storageRef(storage, `diplomas/${uid}/${Date.now()}.${ext}`);
      await uploadBytes(dest, diploma, { contentType: diploma.type });
      const diplomaUrl = await getDownloadURL(dest);

      const res = await createProfile({
        displayName: form.displayName,
        applyAsPro: true,
        pro: {
          businessName: form.businessName,
          diplomaUrl,
          phone: form.phone,
          line1: form.line1,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      if (!res.ok) throw new Error(res.error);

      // Profile is saved and emails sent — from here the application is committed,
      // so a hiccup below must NOT roll the account back.
      profileCreated = true;

      // The application is pending approval — sign the applicant out so they are
      // NOT logged in, thank them, then send them to the shop.
      await signOut();
      router.refresh();
      setSubmitted(true);
      setTimeout(() => router.push("/boutique"), 4000);
    } catch (err: unknown) {
      // If the account was created this attempt but a later step failed (diploma
      // upload, profile write…), roll it back so the email can be reused on retry.
      if (createdUser && !profileCreated) {
        try {
          await deleteUser(createdUser);
        } catch {
          /* deletion may need a recent login; ignore and fall through to sign-out */
        }
        await signOut();
      }
      const code = (err as { code?: string })?.code ?? "";
      setError(code.includes("email-already") ? dict.auth.errorEmailInUse : dict.auth.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-5 py-6 text-center">
        <span className="text-3xl text-gold">✦</span>
        <h2 className="font-display text-2xl tracking-wide text-ink">{dict.pro.thanksTitle}</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-ink/65">{dict.pro.thanksDesc}</p>
        <Link
          href="/boutique"
          className="inline-flex h-12 items-center rounded-full bg-[#211a2c] px-7 text-xs uppercase tracking-[0.16em] text-[#faf7f2] transition-colors hover:bg-[#382c42]"
        >
          {dict.pro.thanksCta}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      {!configured && (
        <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-gold">
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

      <div className="border-t border-ink/10 pt-4">
        <Field label={dict.pro.businessName}>
          <input required value={form.businessName} onChange={set("businessName")} className={inputClass} />
        </Field>
        <div className="mt-4">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-ink-mute">
            {dict.pro.diploma}
          </span>
          <DiplomaDropzone value={diploma} onChange={setDiploma} />
          {dict.pro.diplomaHint && (
            <span className="mt-1 block text-xs text-ink/45">{dict.pro.diplomaHint}</span>
          )}
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
      <p className="pt-2 text-center text-sm text-ink/65">
        {dict.pro.alreadyMember}{" "}
        <Link href="/pro/connexion" className="text-ink/70 underline-offset-4 hover:text-ink hover:underline">
          {dict.nav.login}
        </Link>
      </p>
    </form>
  );
}
