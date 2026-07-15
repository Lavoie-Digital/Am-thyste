import { PartnerManager } from "@/components/dashboard/PartnerManager";
import { getI18n } from "@/lib/i18n/server";
import { getAllPartnersRaw } from "@/lib/data/partners";

export default async function AdminPartnersPage() {
  const { dict } = await getI18n();
  const partners = await getAllPartnersRaw();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-ink">{dict.admin.partners}</h1>
        <p className="mt-2 max-w-xl text-sm text-ink/55">{dict.admin.partnersHint}</p>
      </header>
      <PartnerManager initial={partners} />
    </div>
  );
}
