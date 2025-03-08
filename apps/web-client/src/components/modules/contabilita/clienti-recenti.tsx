import { Suspense } from "react";

import { getClientiRecenti } from "@repo/database/queries/clienti";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { session } from "@/lib/session";

import { ClienteDashboardCard } from "../clienti/cliente-dashboard-card";
import { CientiEmptyState } from "../clienti/clienti-empty-state";

export function ClientiRecenti({ anno }: { anno: string }) {
  return (
    <Suspense fallback={<Skeleton className="h-[402px] w-full" />}>
      <ClientiRecentiContent anno={anno} />
    </Suspense>
  );
}

async function ClientiRecentiContent({ anno }: { anno: string }) {
  const { user } = await session();
  const data = await getClientiRecenti({ anno, userId: user.id });
  return (
    <Card className="w-full lg:max-w-md">
      <CardHeader>
        <CardTitle>Clienti Recenti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-9">
          {data?.length > 0 ? data?.map(cliente => (
            <ClienteDashboardCard
              key={cliente.id}
              {...cliente}
            />
          )) : <CientiEmptyState className="border-0 py-6" />}
        </div>
      </CardContent>
    </Card>
  );
}
