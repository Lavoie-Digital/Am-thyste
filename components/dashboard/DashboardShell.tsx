import { DashboardSidebar } from "./DashboardSidebar";

/** Layout shell shared by the admin and owner-dashboard route groups. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col lg:flex-row">
      <DashboardSidebar />
      <div className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</div>
    </div>
  );
}
