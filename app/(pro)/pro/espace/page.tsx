import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";
import { requireUser, isApprovedPro } from "@/lib/auth/dal";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata = noindexMetadata("Espace partenaire", false);

export default async function ProEspacePage() {
  const { dict } = await getI18n();
  const viewer = await requireUser("/pro/connexion?redirect=/pro/espace");

  // Owner/admin manage everything from the dashboard.
  if (viewer.role === "admin") redirect("/tableau-de-bord");

  // A signed-in account with no pro application must fill out the form — send
  // it straight there. (Not to the /pro marketing page: that looked like a broken
  // login. The form says "Connecté comme {email}, complétez le formulaire".)
  // Login, Google sign-in, the navbar and /pro/boutique all land here, so this
  // one redirect covers every way in.
  if (viewer.role !== "pro") redirect("/pro/inscription");

  const approved = isApprovedPro(viewer);
  const state = approved
      ? { label: dict.pro.title, title: dict.pro.approvedTitle, desc: dict.pro.approvedDesc, accent: "text-gold" }
      : viewer.proStatus === "rejected"
        ? { label: dict.admin.status, title: dict.pro.rejectedTitle, desc: dict.pro.rejectedDesc, accent: "text-red-300/70" }
        : { label: dict.admin.status, title: dict.pro.pendingTitle, desc: dict.pro.pendingDesc, accent: "text-amethyst-600" };

  return (
    // pt-40 clears the 133px fixed navbar (py-32 left the card tucked under it
    // on mobile); the shorter min-height kills the dead space above the footer.
    <div className="flex min-h-[60svh] items-center justify-center pb-20 pt-40 sm:pb-28">
      <Container className="max-w-xl">
        <div className="surface rounded-2xl p-7 text-center sm:p-14">
          <p className={`eyebrow ${state.accent}`}>{state.label}</p>
          <h1 className="mt-5 heading text-3xl sm:text-4xl">{state.title}</h1>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink/60">{state.desc}</p>

          {approved ? (
            <div className="mt-9">
              <ButtonLink href="/pro/boutique" variant="gold" size="lg">{dict.pro.viewCatalog}</ButtonLink>
            </div>
          ) : (
            <div className="mt-9">
              <Link href="/boutique" className="inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-[0.18em] text-ink/55 transition-colors hover:text-ink">
                {dict.checkout.backToShop}
              </Link>
            </div>
          )}

          <p className="mt-8 border-t border-ink/8 pt-6 text-xs text-ink/45">
            {viewer.email}
          </p>
        </div>
      </Container>
    </div>
  );
}
