"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Field, inputClass } from "./AuthShell";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const { dict } = useLocale();
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!configured) {
      setError(dict.auth.errorGeneric);
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
    } catch (err: unknown) {
      // Never reveal whether the email exists — only surface real failures.
      const code = (err as { code?: string })?.code ?? "";
      if (!code.includes("user-not-found") && !code.includes("invalid-email")) {
        setError(dict.auth.errorGeneric);
        setLoading(false);
        return;
      }
    }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="space-y-5 py-2 text-center">
        <span className="text-3xl text-gold">✦</span>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-ink/65">{dict.auth.resetLinkSent}</p>
        <Link href="/pro/connexion" className="text-sm text-ink/70 underline-offset-4 hover:text-ink hover:underline">
          {dict.auth.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {!configured && (
        <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-gold">
          Firebase n&apos;est pas encore configuré. Ajoutez vos clés dans .env.local.
        </p>
      )}
      <Field label={dict.common.email}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </Field>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? dict.common.sending : dict.auth.sendResetLink}
      </Button>
      <p className="pt-2 text-center text-sm text-ink/65">
        <Link href="/pro/connexion" className="text-ink/70 underline-offset-4 hover:text-ink hover:underline">
          {dict.auth.backToLogin}
        </Link>
      </p>
    </form>
  );
}
