"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { getFattura } from "@repo/database/queries/fatture";

import { zodResolver } from "@hookform/resolvers/zod";
import { FatturaStato } from "@repo/database/lib/enums";
import { CreateFatturaSchema } from "@repo/database/schema";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { cambiaStatoFattura } from "@/server/actions/fatture";

const SaldaFatturaFormSchema = CreateFatturaSchema.extend({ dataSaldo: z.coerce.date() }).pick({ dataSaldo: true });

export function SaldaFatturaModal(
  props: {
    fattura: Awaited<ReturnType<typeof getFattura>>;
    trigger?: ReactNode;
    onConfirm?: () => void;
  },
) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { execute, isPending } = useServerAction(cambiaStatoFattura, {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["fatture"] });
      props.onConfirm?.();
      toast.success("Fattura Saldata con successo.");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });
  const form = useForm<z.infer<typeof SaldaFatturaFormSchema>>({
    resolver: zodResolver(SaldaFatturaFormSchema),
    defaultValues: {
      dataSaldo: new Date(),
    },
  });

  async function handleConfirm(values: z.infer<typeof SaldaFatturaFormSchema>) {
    if (!props.fattura)
      return;
    return execute({ ...values, id: props.fattura.id, stato: FatturaStato.SALDATA });
  }

  const before = props.fattura ? new Date(format(props.fattura.dataEmissione, "yyyy-MM-dd")) : undefined;

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Salda Fattura"
      description="Confermando, i tuoi ricavi verranno aggiornati e la fattura verrà contrassegnata come saldata."
      confirmText="Salda"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button variant="secondary" size="sm">Salda</Button>
      )}
    >
      <Form {...form}>
        <FormFields.DatePicker name="dataSaldo" description="Inserisci la data saldo per questa fattura." label="Data Saldo" options={{ disabled: before ? { before } : undefined }} />
      </Form>
    </Modal>
  );
}
