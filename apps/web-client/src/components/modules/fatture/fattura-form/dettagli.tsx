"use client";
import type { getIndirizzi } from "@repo/database/queries/indirizzi";

import { FatturaPreferenzaDataSaldo, FatturaPreferenzaDataSaldoValues } from "@repo/database/lib/enums";
import { CreateFatturaSchema } from "@repo/database/schema";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useParams } from "next/navigation";

import { formatAddress } from "@/lib/address";

export const FatturaDettagliSchema = CreateFatturaSchema.pick({ numeroProgressivo: true, indirizzoId: true, dataEmissione: true, preferenzaDataSaldo: true });

export function Dettagli({ indirizzi }: { indirizzi: Awaited<ReturnType<typeof getIndirizzi>>["data"] }) {
  const { anno } = useParams<{ anno: string }>();
  const before = new Date(`${anno}-01-01`);
  const after = new Date(`${anno}-12-31`);

  return (
    <div className="space-y-4">
      <FormFields.Input type="number" description="Il numero progressivo della fattura." name="numeroProgressivo" label="Numero Progressivo" />
      <FormFields.Select name="indirizzoId" label="Indirizzo" description="L'indirizzo da mostrare in fattura." options={indirizzi.map(p => ({ label: formatAddress(p), value: p.id })) || []} />
      <FormFields.DatePicker name="dataEmissione" description="annodi emissione della fattura." label="Data" options={{ disabled: { before, after } }} />
      <FormFields.Select name="preferenzaDataSaldo" description="Entro quando preferisci che avvenga il saldo di questa fattura?" label="Preferenza Data Saldo" options={FatturaPreferenzaDataSaldoValues.map(p => ({ label: p === FatturaPreferenzaDataSaldo.IMMEDIATO ? "Immediato" : `${p} giorni`, value: p }))} />
    </div>
  );
}
