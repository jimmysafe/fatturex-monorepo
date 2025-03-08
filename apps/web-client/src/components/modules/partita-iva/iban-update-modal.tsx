"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { getPartitaIva } from "@repo/database/queries/partita-iva";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { updatePartitaIva } from "@/server/actions/partita-iva";

const IbanFormSchema = z.object({
  iban: z.string().min(15).max(34),
  ibanIntestatario: z.string().min(1),
  ibanBanca: z.string().min(1),
});

export function IbanUpdateModal(
  props: {
    trigger?: ReactNode;
    onConfirm?: () => void;
  },
) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: partitaIva, isLoading } = useQuery<Awaited<ReturnType<typeof getPartitaIva>>>({
    queryKey: ["partita-iva"],
    queryFn: () => fetch("/api/partita-iva").then(res => res.json()),
    enabled: open,
  });

  const { execute, isPending } = useServerAction(updatePartitaIva, {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["partita-iva"] });
      props.onConfirm?.();
      toast.success("IBAN aggiornato con successo.");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });
  const form = useForm<z.infer<typeof IbanFormSchema>>({
    resolver: zodResolver(IbanFormSchema),
  });

  async function handleConfirm(values: z.infer<typeof IbanFormSchema>) {
    if (!partitaIva)
      return toast.error("Partita IVA non trovata.");
    return execute({ ...values, id: partitaIva.id });
  }

  if (isLoading)
    return <></>;

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Aggiorna IBAN"
      description="Aggiorna l'IBAN del conto corrente. Queste informazioni sono necessarie per inviare una fattura con modalità di pagamento Bonifico."
      confirmText="Salva"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button variant="ghost">
          Aggiorna Dettagli IBAN
          <ArrowRight />
        </Button>
      )}
    >
      <Form {...form}>
        <div className="space-y-2">
          <FormFields.Input name="iban" label="IBAN" />
          <FormFields.Input name="ibanIntestatario" label="Intestatario" description="Il nome dell'intestatario del conto corrente." />
          <FormFields.Input name="ibanBanca" label="Banca" description="Il nome della banca del conto corrente." />
        </div>
      </Form>
    </Modal>
  );
}
