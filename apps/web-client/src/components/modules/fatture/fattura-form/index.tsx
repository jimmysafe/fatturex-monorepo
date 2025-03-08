"use client";
import type { getIndirizzi } from "@repo/database/queries/indirizzi";

import { MultiStepForm } from "@repo/ui/components/extensive/multi-step-form";
import { z } from "zod";

import { Anteprima } from "@/components/modules/fatture/fattura-form/anteprima";
import { Articoli, FatturaArticoliSchema } from "@/components/modules/fatture/fattura-form/articoli";
import { Cliente, FatturaClienteSchema } from "@/components/modules/fatture/fattura-form/cliente";
import { Dettagli, FatturaDettagliSchema } from "@/components/modules/fatture/fattura-form/dettagli";
import { FatturaImpostazioniSchema, Impostazioni } from "@/components/modules/fatture/fattura-form/impostazioni";

export function FatturaForm<B>({
  onSubmit,
  onSubmitLoading,
  defaultValues,
  indirizzi,
}: {
  onSubmit: (values: B) => Promise<any>;
  onSubmitLoading: boolean;
  defaultValues?: Record<string, unknown>;
  indirizzi: Awaited<ReturnType<typeof getIndirizzi>>["data"];
}) {
  return (
    <MultiStepForm
      variant="default"
      onSubmit={onSubmit}
      onSubmitLoading={onSubmitLoading}
      defaultValues={defaultValues}
      steps={[
        {
          id: "cliente",
          label: "Cliente",
          schema: FatturaClienteSchema,
          component: <Cliente />,
          descrizione:
            "Per procedere con la fatturazione:\n\n"
            + "• Seleziona un cliente esistente dalla tua rubrica\n"
            + "• Oppure crea una nuova anagrafica cliente",
        },
        {
          id: "dettagli",
          label: "Dettagli",
          schema: FatturaDettagliSchema,
          component: <Dettagli indirizzi={indirizzi || []} />,
          descrizione:
            "Inserisci i dettagli della tua fattura.\n\n Il numero progressivo viene calcolato automaticamente in base all'ultima fattura che hai emesso quest'anno. \nConsigliamo comunque di controllare che sia corretto.",
        },
        {
          id: "articoli",
          label: "Articoli e Voci",
          schema: FatturaArticoliSchema,
          component: <Articoli />,
          descrizione: "Aggiungi descrizione e causale della tua fattura. \nPuoi inserire più righe, modificarle e cancellarle.",
        },
        {
          id: "impostazioni",
          label: "Impostazioni",
          schema: FatturaImpostazioniSchema,
          component: <Impostazioni />,
          descrizione: "Imposta le preferenze della tua fattura. \nPuoi scegliere il metodo di pagamento, la lingua ed eventuali addebiti aggiuntivi.",
        },
        {
          id: "anteprima",
          label: "Anteprima",
          schema: z.any(),
          component: <Anteprima isSubmitting={onSubmitLoading} />,
          descrizione: "Controlla l'anteprima della tua fattura. \nPuoi visualizzare e controllare tutti i dettagli prima salvare la fattura. Una volta salvata potrai sempre modificarla.",
        },
      ]}
    />
  );
}
