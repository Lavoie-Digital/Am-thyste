import { ProSignupForm } from "@/components/pro/ProSignupForm";
import { Container } from "@/components/ui/Container";
import { getI18n } from "@/lib/i18n/server";

export default async function InscriptionPage() {
  const { dict } = await getI18n();
  return (
    <div className="flex min-h-[100svh] items-center justify-center py-32">
      <Container className="max-w-2xl">
        <div className="rounded-3xl glass-strong p-8 sm:p-10">
          <div className="mb-8 text-center">
            <span className="text-gold">✦</span>
            <h1 className="mt-3 font-display text-3xl tracking-wide text-amethyst-50">
              {dict.pro.signupTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-amethyst-200/70">
              {dict.pro.signupDesc}
            </p>
          </div>
          <ProSignupForm />
        </div>
      </Container>
    </div>
  );
}
