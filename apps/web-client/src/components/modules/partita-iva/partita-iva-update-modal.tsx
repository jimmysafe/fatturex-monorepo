"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { getPartitaIva } from "@repo/database/queries/partita-iva";
import type { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { UpdatePartitaIvaSchema } from "@repo/database/schema";
import { province } from "@repo/shared/province";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { updatePartitaIva } from "@/server/actions/partita-iva";

export function PartitaIvaUpdateModal(
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
      toast.success("Partita IVA aggiornata con successo.");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });
  const form = useForm<z.infer<typeof UpdatePartitaIvaSchema>>({
    resolver: zodResolver(UpdatePartitaIvaSchema),
    defaultValues: partitaIva || {},
  });

  async function handleConfirm(values: z.infer<typeof UpdatePartitaIvaSchema>) {
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
      title="Aggiorna Partita IVA"
      description="Modifica i dettagli della tua Partita IVA."
      confirmText="Salva"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button size="sm" variant="ghost" className="text-primary">
          <Edit />
          Modifica
        </Button>
      )}
    >
      <Form {...form}>
        <div className="space-y-2">
          <FormFields.Input name="codiceAteco" label="Codice Ateco" description="es. 02.02.02" />
          <div className="py-4"><Separator /></div>
          <FormFields.Input name="indirizzo" label="Indirizzo" />
          <FormFields.Input name="cap" label="CAP" />
          <FormFields.Input name="comune" label="Comune" />
          <FormFields.Select name="provincia" label="Provincia" options={province} />
          <div className="py-4"><Separator /></div>
          <FormFields.Input name="iban" label="IBAN" />
          <FormFields.Input name="ibanIntestatario" label="Intestatario" description="Il nome dell'intestatario del conto corrente." />
          <FormFields.Input name="ibanBanca" label="Banca" description="Il nome della banca del conto corrente." />
        </div>
      </Form>
    </Modal>
  );
}
