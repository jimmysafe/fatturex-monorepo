import { IndirizziCard } from "@/components/modules/impostazioni/indirizzi-card";
import { ThemeSettingsCard } from "@/components/modules/impostazioni/theme-settings-card";

export default function SettingsPage() {
  return (
    <main className="space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ThemeSettingsCard />
        <IndirizziCard />
      </section>
    </main>
  );
}
