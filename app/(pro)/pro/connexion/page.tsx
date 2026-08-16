import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getI18n } from "@/lib/i18n/server";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata = noindexMetadata("Connexion");

export default async function ConnexionPage() {
  const { dict } = await getI18n();
  return (
    <AuthShell title={dict.pro.loginTitle} subtitle={dict.brand.subtitle}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
