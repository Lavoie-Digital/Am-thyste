import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getI18n } from "@/lib/i18n/server";
import { getSettings } from "@/lib/data/settings";

export default async function SettingsPage() {
  const { dict } = await getI18n();
  const settings = await getSettings();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-wide text-amethyst-50">{dict.dashboard.settings}</h1>
      </header>
      <SettingsForm settings={settings} />
    </div>
  );
}
