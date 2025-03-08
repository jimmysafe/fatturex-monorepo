import { getRicavoAnnuale } from "@repo/database/queries/contabilita";

import { ClientiRecenti } from "@/components/modules/contabilita/clienti-recenti";
import { ContabilitaChart } from "@/components/modules/contabilita/contabilita-chart";
import { DashboardCards } from "@/components/modules/dashboard/dashboard-cards";
import { FattureListLatest } from "@/components/modules/fatture/fatture-list-latest";
import { session } from "@/lib/session";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ anno: string }>;
}) {
  const anno = (await params).anno;
  const { user } = await session();
  const ricavoAnnualePromise = getRicavoAnnuale({ anno, userId: user.id });

  return (
    <section className="space-y-4">
      <DashboardCards anno={anno} />
      <div className="flex flex-col gap-4 lg:flex-row">
        <ContabilitaChart promise={ricavoAnnualePromise} />
        <ClientiRecenti anno={anno} />
      </div>
      <div className="space-y-6 pt-4">
        <h3 className="font-semibold leading-none tracking-tight">Fatture Recenti</h3>
        <FattureListLatest anno={anno} />
      </div>
    </section>
  );
}
