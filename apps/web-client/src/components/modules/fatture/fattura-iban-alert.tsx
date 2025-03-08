import type { getFattura } from "@repo/database/queries/fatture";

import { FatturaMetodoPagamento } from "@repo/database/lib/enums";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";

import { _getPartitaIva } from "@/lib/cached/get-partita-iva";

import { IbanUpdateModal } from "../partita-iva/iban-update-modal";

export async function FatturaIbanAlert(fattura: Awaited<ReturnType<typeof getFattura>>) {
  if (!fattura)
    return null;

  const partitaIva = await _getPartitaIva();
  const dettagliIbanIncompleti = !partitaIva?.iban || !partitaIva?.ibanIntestatario || !partitaIva?.ibanBanca;

  if (!dettagliIbanIncompleti || fattura.metodoPagamento !== FatturaMetodoPagamento.BONIFICO)
    return <></>;

  return (
    <Alert variant="warn">
      <AlertTitle>Dettagli IBAN mancanti.</AlertTitle>
      <AlertDescription>
        Completa i dettagli IBAN per poter inviare la fattura con modalità di pagamento Bonifico.
      </AlertDescription>
      <div className="flex justify-end pt-2">
        <IbanUpdateModal />
      </div>
    </Alert>
  );
}
