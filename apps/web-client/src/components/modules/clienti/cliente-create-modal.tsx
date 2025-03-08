"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreateClienteSchema } from "@repo/database/schema";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { Separator } from "@repo/ui/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { createCliente } from "@/server/actions/clienti";

import { ClienteFormFields } from "./cliente-form-fields";
import { ClienteSearchBancaDatiModal } from "./cliente-search-banca-dati-modal";

export function ClienteCreateModal(props: {
  trigger?: ReactNode;
  onConfirm?: (data: any) => any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof CreateClienteSchema>>({
    resolver: zodResolver(CreateClienteSchema),
  });

  const { execute: creaCliente, isPending } = useServerAction(createCliente, {
    onSuccess({ data }) {
      queryClient.invalidateQueries({ queryKey: ["clienti"] });
      toast.success("Cliente creato con successo");
      props.onConfirm?.(data);
      setIsOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleSubmit(data: z.infer<typeof CreateClienteSchema>) {
    const { ...payload } = data;
    return creaCliente({ ...payload, cap: data.cap || "", comune: data.comune || "" });
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Nuovo cliente"
      description="Inserisci i dati del nuovo cliente"
      trigger={props.trigger || (
        <Button variant="ghost" className="text-primary" data-testid="cliente-create-modal-trigger">
          <PlusIcon className="size-8" />
          Nuovo Cliente
        </Button>
      )}
      onConfirmLoading={isPending}
      onConfirm={form.handleSubmit(handleSubmit)}
    >
      <Form {...form}>
        <ClienteSearchBancaDatiModal />
        <div className="flex w-full items-center gap-2 py-8">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">oppure inserisci manualmente</span>
          <Separator className="flex-1" />
        </div>
        <ClienteFormFields />
      </Form>
    </Modal>
  );
}
