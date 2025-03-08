"use client";
import { useState } from "react";

import type { ButtonProps } from "@repo/ui/components/ui/button";

import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { deleteFattura } from "@/server/actions/fatture";

export function FatturaDeleteModal(props: {
  trigger?: React.ReactNode;
  triggerProps?: ButtonProps;
  fatturaId: string;
}) {
  const router = useRouter();
  const { anno } = useParams<{ anno: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const { execute, isPending } = useServerAction(deleteFattura, {
    onSuccess() {
      toast.success("Fattura eliminata con successo");
      router.push(`/${anno}/fatture`);
      setIsOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Elimina Fattura"
      confirmText="Conferma"
      description="Sei sicuro di voler eliminare questa fattura?"
      trigger={props.trigger || (
        <Button size="sm" {...props.triggerProps}>
          Elimina Fattura
        </Button>
      )}
      onConfirmLoading={isPending}
      onConfirm={async () => {
        await execute({
          id: props.fatturaId,
        });
      }}
    >
      <></>
    </Modal>
  );
}
