import { FteConfigurationCard } from "@/components/modules/partita-iva/fte-configuration-card";
import { AbbonamentoCard } from "@/components/modules/profilo/abbonamento-card";
import { ContabilitaList } from "@/components/modules/profilo/contabilita-list";
import { PartitaIvaCard } from "@/components/modules/profilo/partita-iva-card";
import { ProfiloCard } from "@/components/modules/profilo/profilo-card";

export default function ProfiloPage() {
  return (
    <main className="space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AbbonamentoCard />
        <FteConfigurationCard />
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProfiloCard />
        <PartitaIvaCard />
      </section>
      <ContabilitaList />
    </main>
  );
}
