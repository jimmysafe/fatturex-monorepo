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
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { stsInvioFattura } from "@/server/actions/sts";

const Schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  pincode: z.string().min(1),
  flagOpposizione: z.boolean().default(false),
});

export function FatturaStsInvioModal(
  props: {
    fattura: Awaited<ReturnType<typeof getFattura>>;
    trigger?: ReactNode;
    onConfirm?: () => void;
  },
) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const { execute, isPending } = useServerAction(stsInvioFattura, {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["fatture"] });
      queryClient.invalidateQueries({ queryKey: ["contabilita"] });
      queryClient.invalidateQueries({ queryKey: ["ricavo"] });
      props.onConfirm?.();
      toast.success("Invio avvenuto con successo!");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleConfirm(values: z.infer<typeof Schema>) {
    if (!props.fattura)
      return;
    await execute({ id: props.fattura.id, ...values });
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Invio Sistema Tessera Sanitaria"
      description="Compila i tuoi dati e invia la fattura al Sistema Tessera Sanitaria"
      confirmText="Invia"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button className="w-full">
          Invia
          <ArrowRight />
        </Button>
      )}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormFields.Input name="username" label="Username" description="Username che utilizzi per accedere alla piattaforma Sistema Tessera Sanitaria" />
          <FormFields.Input name="password" label="Password" description="Password che utilizzi per accedere alla piattaforma Sistema Tessera Sanitaria" />
          <FormFields.Input name="pincode" label="Codice PIN" description="Codice Pin che utilizzi per accedere alla piattaforma Sistema Tessera Sanitaria" />
          <div className="py-10">
            <FormFields.Checkbox name="flagOpposizione" label="Voglio applicare il flag di opposizione." />
          </div>
        </div>
      </Form>
    </Modal>
  );
}
