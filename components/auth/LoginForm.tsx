"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Field, inputClass } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const { dict } = useLocale();
  const { signIn, configured } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!configured) {
      setError(dict.auth.errorGeneric);
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.push(params.get("redirect") || "/pro/espace");
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(
        code.includes("invalid") || code.includes("wrong-password") || code.includes("user-not-found")
          ? dict.auth.errorInvalid
          : dict.auth.errorGeneric,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {!configured && (
        <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-gold-soft">
          Firebase n&apos;est pas encore configuré. Ajoutez vos clés dans .env.local.
        </p>
      )}
      <Field label={dict.common.email}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
      </Field>
      <Field label={dict.common.password}>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
      </Field>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? dict.common.loading : dict.nav.login}
      </Button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-amethyst-300/15" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-amethyst-200/40">ou</span>
        <span className="h-px flex-1 bg-amethyst-300/15" />
      </div>
      <GoogleButton />

      <p className="pt-2 text-center text-sm text-amethyst-200/70">
        {dict.auth.noAccount}{" "}
        <Link href="/pro/inscription" className="text-amethyst-200 underline-offset-4 hover:text-white hover:underline">
          {dict.pro.join}
        </Link>
      </p>
    </form>
  );
}
