"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import type { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreateIndirizzoSchema } from "@repo/database/schema";
import { province } from "@repo/shared/province";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { createIndirizzo } from "@/server/actions/indirizzi";

export function IndirizzoCreateModal() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof CreateIndirizzoSchema>>({
    resolver: zodResolver(CreateIndirizzoSchema),
  });

  const { execute, isPending } = useServerAction(createIndirizzo, {
    onSuccess() {
      toast.success("Indirizzo creato con successo");
      queryClient.invalidateQueries({ queryKey: ["indirizzi"] });
      setIsOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleConfirm(values: z.infer<typeof CreateIndirizzoSchema>) {
    return execute(values);
  }

  return (
    <Modal
      title="Aggiungi indirizzo"
      description="Aggiungi un nuovo indirizzo da utilizzare nelle tue fatture."
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={(
        <Button variant="ghost" size="sm">
          <PlusIcon />
          Aggiungi
        </Button>
      )}
      confirmText="Aggiungi"
      onConfirm={form.handleSubmit(handleConfirm)}
      onConfirmLoading={isPending}
    >
      <Form {...form}>
        <form className="space-y-2">
          <FormFields.Input name="indirizzo" label="Indirizzo" />
          <FormFields.Input name="citta" label="Città" />
          <FormFields.Input name="cap" label="CAP" />
          <FormFields.Input name="comune" label="Comune" />
          <FormFields.Select name="provincia" label="Provincia" options={province} />
        </form>
      </Form>
    </Modal>
  );
}
