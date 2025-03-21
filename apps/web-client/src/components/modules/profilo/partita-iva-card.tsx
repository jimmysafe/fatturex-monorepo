import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TextRow } from "@repo/ui/components/ui/text-row";
import { format } from "date-fns";

import { PartitaIvaUpdateModal } from "@/components/modules/partita-iva/partita-iva-update-modal";
import { formatAddress } from "@/lib/address";
import { _getPartitaIva } from "@/lib/cached/get-partita-iva";

export function PartitaIvaCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[374px]" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const partitaIva = await _getPartitaIva();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Partita Iva
          <PartitaIvaUpdateModal />
        </CardTitle>
        <CardDescription>Informazioni Partita Iva</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <TextRow label="Numero" value={partitaIva?.numero} />
        <TextRow label="Anno Apertura" value={partitaIva?.dataApertura ? format(partitaIva.dataApertura, "yyyy") : ""} />
        <TextRow label="Codice Fiscale" value={partitaIva?.codiceFiscale} />
        <TextRow label="Indirizzo" value={partitaIva ? formatAddress(partitaIva) : ""} />
        <TextRow label="IBAN" value={partitaIva?.iban} />
        <TextRow label="Banca" value={partitaIva?.ibanBanca} />
        <TextRow label="Intestatario IBAN" value={partitaIva?.ibanIntestatario} />
      </CardContent>
    </Card>
  );
}
