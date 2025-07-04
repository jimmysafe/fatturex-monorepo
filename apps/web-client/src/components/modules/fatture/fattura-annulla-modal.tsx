"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { getFattura } from "@repo/database/queries/fatture";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { annullaFattura } from "@/server/actions/fatture";

const FormSchema = z.object({
  mode: z.enum(["totale", "parziale"]),
  amount: z.string().optional(),
}).refine((data) => {
  if (data.mode === "parziale") {
    return !!data.amount && Number(data.amount) > 0;
  }
  return true;
}, {
  message: "L'importo è obbligatorio per l'annullamento parziale",
  path: ["amount"],
});

export function FatturaAnnullaModal(
  props: {
    fattura: Awaited<ReturnType<typeof getFattura>>;
    trigger?: ReactNode;
    onConfirm?: () => void;
  },
) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mode: "totale",
    },
  });

  const { execute, isPending } = useServerAction(annullaFattura, {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["fatture"] });
      props.onConfirm?.();
      toast.success("Fattura Annullata con successo.");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleConfirm(values: z.infer<typeof FormSchema>) {
    if (!props.fattura)
      return;
    await execute({ ...values, id: props.fattura.id });
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Annulla Fattura"
      confirmText="Conferma"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button variant="secondary" size="sm">Annulla</Button>
      )}
    >
      <div className="space-y-10 text-muted-foreground">
        <Form {...form}>
          <div className="space-y-4">
            <FormFields.Select
              name="mode"
              label="Tipo di annullamento"
              options={[
                { label: "Totale", value: "totale" },
                { label: "Parziale", value: "parziale" },
              ]}
            />
            { form.watch("mode") === "parziale" && (
              <FormFields.Input name="amount" label="Importo" type="number" />
            )}
          </div>
        </Form>
        { form.watch("mode") === "totale" && (
          <>
            <p>Confermando, i tuoi ricavi verranno aggiornati e la fattura verrà contrassegnata come annullata.</p>
            <p>Verrá inoltre emessa una nota di credito all'Agenzia delle Entrate, notificando l'annullamento di questa fattura.</p>
            <p>Sei sicuro di voler procedere?</p>
          </>
        )}
        { form.watch("mode") === "parziale" && (
          <>
            <p>Confermando, i tuoi ricavi verranno aggiornati e una nota di credito verrà emessa per l'importo selezionato.</p>
            <p>Sei sicuro di voler procedere?</p>
          </>
        )}
      </div>
    </Modal>
  );
}
