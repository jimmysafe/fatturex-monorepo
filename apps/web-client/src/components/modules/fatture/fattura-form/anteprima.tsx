"use client";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import type { UserCassaType } from "@repo/database/lib/enums";
import type { getCliente } from "@repo/database/queries/clienti";
import type { getIndirizzo } from "@repo/database/queries/indirizzi";
import type { CreateFatturaSchema, Fattura } from "@repo/database/schema";
import type { z } from "zod";

import { authClient } from "@repo/auth/client";
import { calcolaTotaliFattura } from "@repo/database/lib/math";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

import PdfPreview from "@/components/modules/fatture/pdf-preview";

export function Anteprima(props: { isSubmitting: boolean }) {
  const {
    data: session,
  } = authClient.useSession();

  const user = session?.user;
  const form = useFormContext<z.infer<typeof CreateFatturaSchema>>();
  const { clienteId, indirizzoId, articoli } = form.getValues();
  const { data: cliente, isLoading: clienteLoading } = useQuery<Awaited<ReturnType<typeof getCliente>>>({
    queryKey: ["clienti", clienteId],
    queryFn: () => fetch(`/api/clienti/${clienteId}`).then(res => res.json()),
    enabled: !!clienteId,
  });
  const { data: indirizzo, isLoading: indirizzoLoading } = useQuery<Awaited<ReturnType<typeof getIndirizzo>>>({
    queryKey: ["indirizzi", indirizzoId],
    queryFn: () => fetch(`/api/indirizzi/${indirizzoId}`).then(res => res.json()),
    enabled: !!indirizzoId,
  });

  const totali = useMemo(() => {
    return calcolaTotaliFattura(articoli || [], form.getValues(), user?.cassa as UserCassaType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, articoli]);

  const isLoading = clienteLoading || indirizzoLoading;
  if (isLoading)
    return <Skeleton className="h-[402px] w-full" />;

  if (!cliente || !indirizzo)
    return <p>Impossibile caricare anteprima</p>;

  const fattura = form.getValues() as Fattura;

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-md shadow-fade">
      {form.formState.isSubmitting || props.isSubmitting
        ? <Skeleton className="h-[402] w-full" />
        : (
            <PdfPreview
              fattura={{ ...fattura, ...totali, cliente, indirizzo }}
            />
          )}
    </div>
  );
}
