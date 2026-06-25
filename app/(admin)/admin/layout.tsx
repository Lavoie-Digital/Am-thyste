import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireRole } from "@/lib/auth/dal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin", "/pro/connexion?redirect=/admin");
  return <DashboardShell>{children}</DashboardShell>;
}
