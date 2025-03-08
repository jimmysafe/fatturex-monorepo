import { Suspense } from "react";

import { getContabilitaByAnno } from "@repo/database/queries/contabilita";
import { price } from "@repo/shared/price";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { EuroIcon, TrendingDown, TrendingUp } from "lucide-react";

import { session } from "@/lib/session";

import { ContabilitaCard } from "../contabilita/contabilita-card";

export function DashboardCards({ anno }: { anno: string }) {
  return (
    <Suspense fallback={<DashboardCardsSkeleton />}>
      <DashboardCardsContent anno={anno} />
    </Suspense>
  );
}

async function DashboardCardsContent({ anno }: { anno: string }) {
  const { user } = await session();
  const contabilita = await getContabilitaByAnno({ anno, userId: user.id });
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ContabilitaCard
        title="Fatturato"
        value={price(contabilita?.fatturato)}
        icon={EuroIcon}
        description="Fatturato totale"
      />
      <ContabilitaCard
        title="Netto"
        value={price(contabilita?.redditoNetto)}
        icon={TrendingUp}
        description="Fatturato netto"
      />
      <ContabilitaCard
        title="Da pagare"
        value={price(contabilita?.totaleTasse)}
        icon={TrendingDown}
        description="Totale tasse da pagare"
      />
    </div>
  );
}

function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  );
}
