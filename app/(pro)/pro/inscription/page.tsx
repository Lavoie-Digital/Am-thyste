import { ProSignupForm } from "@/components/pro/ProSignupForm";
import { Container } from "@/components/ui/Container";
import { getI18n } from "@/lib/i18n/server";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata = noindexMetadata("Inscription professionnelle");

export default async function InscriptionPage() {
  const { dict } = await getI18n();
  return (
    // pt-40 clears the 133px fixed navbar — py-32 (128px) left the card's top
    // corners and the ✦ mark sitting behind the bar on a phone.
    <div className="flex min-h-[100svh] items-center justify-center pb-20 pt-40 sm:pb-28">
      <Container className="max-w-2xl">
        <div className="rounded-3xl glass-strong p-6 sm:p-10">
          <div className="mb-8 text-center">
            <span className="text-gold">✦</span>
            <h1 className="mt-3 font-display text-3xl tracking-wide text-ink">
              {dict.pro.signupTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/65">
              {dict.pro.signupDesc}
            </p>
          </div>
          <ProSignupForm />
        </div>
      </Container>
    </div>
  );
}
