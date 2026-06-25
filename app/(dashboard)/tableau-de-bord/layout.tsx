import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireRole } from "@/lib/auth/dal";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin", "/pro/connexion?redirect=/tableau-de-bord");
  return <DashboardShell>{children}</DashboardShell>;
}
