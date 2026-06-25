import { ProApprovalTable } from "@/components/admin/ProApprovalTable";
import { getI18n } from "@/lib/i18n/server";
import { requireRole } from "@/lib/auth/dal";
import { listProUsers } from "@/lib/data/admin";

export default async function AdminProsPage() {
  await requireRole("admin", "/pro/connexion?redirect=/admin/pros");
  const { dict } = await getI18n();
  const pros = await listProUsers();

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-mute">{dict.admin.title}</p>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-ink">{dict.admin.pros}</h1>
      </header>
      <ProApprovalTable initial={pros} />
    </div>
  );
}
