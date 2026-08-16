import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireRole } from "@/lib/auth/dal";
import { noindexMetadata } from "@/lib/seo/site";

/** Covers the whole /admin subtree. */
export const metadata = noindexMetadata("Administration", false);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin", "/pro/connexion?redirect=/admin");
  return <DashboardShell>{children}</DashboardShell>;
}
