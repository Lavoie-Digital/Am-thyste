import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getI18n } from "@/lib/i18n/server";

export default async function MotDePasseOubliePage() {
  const { dict } = await getI18n();
  return (
    <AuthShell title={dict.auth.forgotPasswordTitle} subtitle={dict.auth.forgotPasswordDesc}>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
