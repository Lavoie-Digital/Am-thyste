import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";
import { requireUser, isApprovedPro } from "@/lib/auth/dal";

export default async function ProEspacePage() {
  const { dict } = await getI18n();
  const viewer = await requireUser("/pro/connexion?redirect=/pro/espace");

  // Owner/admin manage everything from the dashboard.
  if (viewer.role === "admin") redirect("/tableau-de-bord");

  const approved = isApprovedPro(viewer);
  const state =
    approved
      ? { label: dict.pro.title, title: dict.pro.approvedTitle, desc: dict.pro.approvedDesc, accent: "text-gold" }
      : viewer.proStatus === "rejected"
        ? { label: dict.admin.status, title: dict.pro.rejectedTitle, desc: dict.pro.rejectedDesc, accent: "text-red-300/70" }
        : { label: dict.admin.status, title: dict.pro.pendingTitle, desc: dict.pro.pendingDesc, accent: "text-amethyst-600" };

  return (
    <div className="flex min-h-[80svh] items-center justify-center py-32">
      <Container className="max-w-xl">
        <div className="surface rounded-2xl p-10 text-center sm:p-14">
          <p className={`eyebrow ${state.accent}`}>{state.label}</p>
          <h1 className="mt-5 heading text-3xl sm:text-4xl">{state.title}</h1>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink/60">{state.desc}</p>

          {approved ? (
            <div className="mt-9">
              <ButtonLink href="/pro/boutique" variant="gold" size="lg">{dict.pro.viewCatalog}</ButtonLink>
            </div>
          ) : (
            <div className="mt-9">
              <Link href="/boutique" className="text-xs uppercase tracking-[0.18em] text-ink/55 transition-colors hover:text-ink">
                {dict.checkout.backToShop}
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
