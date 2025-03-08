"use client";
import { Suspense, use, useState } from "react";

import type { UserCassaType } from "@repo/database/lib/enums";
import type { getFatturaProssimoProgressivo } from "@repo/database/queries/fatture";
import type { getIndirizzi } from "@repo/database/queries/indirizzi";
import type { CreateFatturaSchema } from "@repo/database/schema";
import type { z } from "zod";

import { FatturaMetodoPagamento, FatturaPreferenzaDataSaldo, FatturaStato } from "@repo/database/lib/enums";
import { calcolaTotaliFattura } from "@repo/database/lib/math";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { UpgradeModal } from "@/components/modules/abbonamento/upgrade-modal";
import { FatturaForm } from "@/components/modules/fatture/fattura-form";
import { createFattura } from "@/server/actions/fatture";

export function NuovaFattura({ cassa, clienteId, progressivoPromise, indirizziPromise }: { cassa: UserCassaType; clienteId?: string; progressivoPromise: ReturnType<typeof getFatturaProssimoProgressivo>; indirizziPromise: ReturnType<typeof getIndirizzi> }) {
  const { data: indirizzi } = use(indirizziPromise);
  const { numeroProgressivo: progressivo } = use(progressivoPromise);

  const [showUpgradeModal, setShwUpgradeModal] = useState(false);

  const { execute: salvaFattura, isPending } = useServerAction(createFattura, {
    onError: ({ err }) => {
      if (err.code === "PAYMENT_REQUIRED") {
        return setShwUpgradeModal(true);
      }
      toast.error(err.message);
    },
  });

  async function onSubmit(values: z.infer<typeof CreateFatturaSchema>) {
    const totali = calcolaTotaliFattura(values.articoli || [], values, cassa);
    await salvaFattura({
      ...values,
      ...totali,
    });
  }

  return (
    <>
      {showUpgradeModal && <UpgradeModal trigger={<></>} open={showUpgradeModal} onOpenChange={setShwUpgradeModal} />}
      <Suspense fallback={<Skeleton className="h-[405px]" />}>
        <FatturaForm
          onSubmit={onSubmit}
          onSubmitLoading={isPending}
          indirizzi={indirizzi}
          defaultValues={{
            stato: FatturaStato.EMESSA,
            clienteId,
            indirizzoId: indirizzi.find(i => i.default)?.id,
            numeroProgressivo: progressivo,
            preferenzaDataSaldo: FatturaPreferenzaDataSaldo.IMMEDIATO,
            dataEmissione: new Date(),
            metodoPagamento: FatturaMetodoPagamento.BONIFICO,
            lingua: "IT",
            articoli: [
              {
                descrizione: "",
                quantita: 1,
                prezzo: 0,
              },
            ],
          }}
        />
      </Suspense>
    </>
  );
}
