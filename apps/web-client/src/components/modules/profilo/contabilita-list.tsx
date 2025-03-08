import { Suspense } from "react";

import { getContabilitaList } from "@repo/database/queries/contabilita";
import { price } from "@repo/shared/price";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TextRow } from "@repo/ui/components/ui/text-row";

import { session } from "@/lib/session";

import { ContabilitaRicalcoloButton } from "../contabilita/contabilita-ricalcolo-button";

export function ContabilitaList() {
  return (
    <Suspense fallback={<Skeleton className="h-[374px]" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const { user } = await session();
  if (!user)
    return null;
  const contabilitaList = await getContabilitaList({ userId: user.id });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Contabilitá</CardTitle>
        <CardDescription>Il resoconto generale delle contabilitá disponibili per anno.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-4">
          {contabilitaList?.data.map(contabilita => (
            <Card key={contabilita.id} className="mx-auto max-w-4xl shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {contabilita.anno}
                  <ContabilitaRicalcoloButton anno={contabilita.anno} />
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
                <TextRow label="Fatturato" value={price(contabilita.fatturato)} />
                <TextRow label="Reddito Netto" value={price(contabilita.redditoNetto)} />
                <TextRow label="Contributi Cassa" value={price(contabilita.daPagare)} />
                <TextRow label="Imposte" value={price(contabilita.daPagareIs)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
