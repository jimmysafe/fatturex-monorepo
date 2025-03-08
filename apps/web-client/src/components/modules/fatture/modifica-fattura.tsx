"use client";
import { use } from "react";

import type { UserCassaType } from "@repo/database/lib/enums";
import type { getFattura } from "@repo/database/queries/fatture";
import type { getIndirizzi } from "@repo/database/queries/indirizzi";
import type { CreateFatturaSchema } from "@repo/database/schema";
import type { z } from "zod";

import { calcolaTotaliFattura } from "@repo/database/lib/math";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { FatturaForm } from "@/components/modules/fatture/fattura-form";
import { updateFattura } from "@/server/actions/fatture";

export function ModificaFattura({ id, cassa, defaultValues, indirizziPromise }: { id: string; defaultValues: Awaited<ReturnType<typeof getFattura>>; cassa: UserCassaType; indirizziPromise: ReturnType<typeof getIndirizzi> }) {
  const { data: indirizzi } = use(indirizziPromise);

  const { execute: salvaFattura, isPending } = useServerAction(updateFattura, {
    onError({ err }) {
      toast.error(err.message);
    },
    onSuccess() {
      toast.success("Fattura salvata con successo");
    },
  });

  async function onSubmit(values: z.infer<typeof CreateFatturaSchema>) {
    const totali = calcolaTotaliFattura(values.articoli || [], values, cassa);
    await salvaFattura({
      id,
      ...values,
      ...totali,
    });
  }

  return (
    <FatturaForm
      onSubmit={onSubmit}
      indirizzi={indirizzi}
      onSubmitLoading={isPending}
      defaultValues={defaultValues || {}}
    />
  );
}
