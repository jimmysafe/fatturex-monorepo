"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { getCliente } from "@repo/database/queries/clienti";
import type { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateClienteSchema } from "@repo/database/schema";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { updateCliente } from "@/server/actions/clienti";

import { ClienteFormFields } from "./cliente-form-fields";

export function ClienteUpdateModal(props: {
  id: string;
  trigger?: ReactNode;
  onConfirm?: (data: any) => any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: cliente, isLoading: clienteLoading } = useQuery<Awaited<ReturnType<typeof getCliente>>>({
    queryKey: ["clienti", props.id],
    queryFn: () => fetch(`/api/clienti/${props.id}`).then(res => res.json()),
  });

  const form = useForm<z.infer<typeof UpdateClienteSchema>>({
    resolver: zodResolver(UpdateClienteSchema),
  });

  const { execute: aggiornaCliente, isPending } = useServerAction(updateCliente, {
    onSuccess({ data }) {
      queryClient.invalidateQueries({ queryKey: ["clienti", props.id] });
      toast.success("Cliente aggiornato con successo");
      props.onConfirm?.(data);
      setIsOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleSubmit(data: z.infer<typeof UpdateClienteSchema>) {
    return aggiornaCliente({ id: props.id, ...data });
  }

  useEffect(() => {
    if (cliente) {
      form.reset(cliente);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Modifica cliente"
      description="Aggiorna i valori di questo cliente."
      trigger={props.trigger || (
        <Button size="sm">
          <PlusCircleIcon className="size-8" />
          <p>Modifica Cliente</p>
        </Button>
      )}
      onConfirmLoading={isPending}
      onConfirm={form.handleSubmit(handleSubmit)}
    >
      {clienteLoading
        ? <Skeleton className="h-32 w-full" />
        : (
            <Form {...form}>
              <ClienteFormFields />
            </Form>
          )}
    </Modal>
  );
}
