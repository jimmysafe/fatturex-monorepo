import { Suspense } from "react";

import { getIndirizzi } from "@repo/database/queries/indirizzi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { formatAddress } from "@/lib/address";
import { session } from "@/lib/session";

import { IndirizzoCreateModal } from "./indirizzo-create-modal";

export function IndirizziCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[286px]" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const { user } = await session();
  const data = await getIndirizzi({ per_page: "50", userId: user.id });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indirizzi</CardTitle>
        <CardDescription>
          Configura gli indirizzi da utilizzare nelle tue fatture.
          Puoi aggiungerne più di uno in base alle tue esigenze.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 !pt-2">
        <div className="flex justify-end">
          <IndirizzoCreateModal />
        </div>
        {data?.data.map(indirizzo => (
          <div key={indirizzo.id} className="w-full border-b border-muted py-2 text-sm">
            <p>{formatAddress(indirizzo)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
