import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireRole } from "@/lib/auth/dal";
import { noindexMetadata } from "@/lib/seo/site";

/** Covers the whole /tableau-de-bord subtree. */
export const metadata = noindexMetadata("Tableau de bord", false);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin", "/pro/connexion?redirect=/tableau-de-bord");
  return <DashboardShell>{children}</DashboardShell>;
}
