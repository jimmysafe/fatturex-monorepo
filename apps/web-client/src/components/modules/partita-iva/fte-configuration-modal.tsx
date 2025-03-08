"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { fteActivate } from "@/server/actions/fattura-elettronica";

const FormSchema = z.object({
  acceptedTerms: z.boolean().refine(v => v, { message: "Devi accettare i termini e le condizioni." }),
});

export function FteConfigurationModal(
  props: {
    trigger?: ReactNode;
    onConfirm?: () => void;
  },
) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { execute, isPending } = useServerAction(fteActivate, {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["partita-iva"] });
      props.onConfirm?.();
      toast.success("Fatturazione Elettronica attivata!");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function handleConfirm(values: z.infer<typeof FormSchema>) {
    return execute({ acceptedTerms: values.acceptedTerms });
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Attiva Fatturazione Elettronica"
      description="Attivando il servizio di fatturazione elettronica potrai inviare le fatture in formato elettronico all'Agenzia delle Entrate."
      confirmText="Attiva"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button className="w-full" variant="ghost">
          Attiva fatturazione elettronica
          <ArrowRight />
        </Button>
      )}
    >
      <div className="min-h-32">
        <pre className="text-sm">{`< Termini e condizioni qui. >`}</pre>
      </div>
      <Form {...form}>
        <div className="space-y-2">
          <FormFields.Checkbox name="acceptedTerms" label="Accetto i termini e condizioni di utilizzo." />
        </div>
      </Form>
    </Modal>
  );
}
