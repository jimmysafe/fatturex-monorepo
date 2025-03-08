"use client";
import type { ReactNode } from "react";
import { useState } from "react";

import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { fteInvioFattura } from "@/server/actions/fattura-elettronica";

export function FatturaFteInvioModal(
  props: {
    id: string;
    trigger?: ReactNode;
    onConfirm?: () => void;
    open?: boolean;
  },
) {
  const [open, setOpen] = useState(props.open || false);
  const queryClient = useQueryClient();
  const { execute, isPending } = useServerAction(fteInvioFattura, {
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

  async function handleConfirm() {
    await execute({ id: props.id });
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Invia Fattura Elettronica"
      description="Confermi l'invio della fattura elettronica?"
      confirmText="Invia"
      onConfirm={handleConfirm}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button className="w-full">
          Invia Fattura Elettronica
          <ArrowRight />
        </Button>
      )}
    >
      <div>
      </div>
    </Modal>
  );
}
