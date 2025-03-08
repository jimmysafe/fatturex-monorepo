"use client";
import { useFormContext } from "react-hook-form";

import type { getPartitaIva } from "@repo/database/queries/partita-iva";

import { authClient } from "@repo/auth/client";
import { FatturaMetodoPagamento, FatturaMetodoPagamentoValues, UserCassa } from "@repo/database/lib/enums";
import { sommaArticoli } from "@repo/database/lib/math";
import { CreateFatturaSchema } from "@repo/database/schema";
import { Button } from "@repo/ui/components/ui/button";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { IbanUpdateModal } from "../../partita-iva/iban-update-modal";

export const FatturaImpostazioniSchema = CreateFatturaSchema.pick({ metodoPagamento: true, idMarcaDaBollo: true, addebitaMarcaDaBollo: true, contributo: true, addebitaContributo: true, lingua: true });

export function Impostazioni() {
  const {
    data: session,
  } = authClient.useSession();
  const user = session?.user;

  const { data: partitaIva, isLoading } = useQuery<Awaited<ReturnType<typeof getPartitaIva>>>({
    queryKey: ["partita-iva"],
    queryFn: () => fetch("/api/partita-iva").then(res => res.json()),
  });

  const dettagliIbanIncompleti = !partitaIva?.iban || !partitaIva?.ibanIntestatario || !partitaIva?.ibanBanca;

  const form = useFormContext();

  const showAddebitaMarcaDaBollo = form.watch("addebitaContributo")
    ? sommaArticoli(form.watch("articoli") ?? [])
    > (user?.cassa === UserCassa.ENPAP ? 75.95 : 74.49)
    : sommaArticoli(form.watch("articoli") ?? []) > 77.47;

  if (isLoading)
    return <></>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormFields.Select name="metodoPagamento" label="Metodo Pagamento" options={FatturaMetodoPagamentoValues.map(p => ({ label: p, value: p }))} />
        {form.getValues("metodoPagamento") === FatturaMetodoPagamento.BONIFICO && dettagliIbanIncompleti && (
          <p className="text-xs">
            <strong>Attenzione:</strong>
            {" "}
            Completa i dettagli IBAN per poter inviare la fattura con modalità di pagamento Bonifico.
            {" "}
            <IbanUpdateModal trigger={(
              <Button variant="link" size="sm" className="p-0">
                Aggiorna Dettagli Iban
                <ArrowRight />
              </Button>
            )}
            />
          </p>
        )}
      </div>
      <FormFields.Select
        name="lingua"
        label="Lingua"
        options={[{
          label: "Italiano",
          value: "IT",
        }, {
          label: "Inglese",
          value: "EN",
        }]}
      />
      <div className="py-6">
        <Separator />
      </div>
      {showAddebitaMarcaDaBollo && (
        <>
          <FormFields.Input name="idMarcaDaBollo" label="ID Marca da Bollo" />
          <FormFields.Checkbox name="addebitaMarcaDaBollo" label="Addebita Marca da Bollo al cliente" />
        </>
      )}
      {user?.cassa === UserCassa.GESTIONE_SEPARATA && (
        <FormFields.Checkbox name="contributo" label="Applica Rivalsa INPS" />
      )}
      {((user?.cassa !== UserCassa.GESTIONE_SEPARATA) || (user?.cassa === UserCassa.GESTIONE_SEPARATA && !!form.watch("contributo"))) && (
        <FormFields.Checkbox name="addebitaContributo" label={user?.cassa === UserCassa.GESTIONE_SEPARATA ? "Addebita Rivalsa INPS" : `Addebita Contributo ${user?.cassa}`} />
      )}

    </div>
  );
}
