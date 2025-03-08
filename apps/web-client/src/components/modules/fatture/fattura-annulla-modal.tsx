"use client";
import type { ReactNode } from "react";
import { useState } from "react";

import type { getFattura } from "@repo/database/queries/fatture";

import { FatturaStato } from "@repo/database/lib/enums";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { cambiaStatoFattura } from "@/server/actions/fatture";

export function FatturaAnnullaModal(
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
      toast.success("Fattura Annullata con successo.");
      setOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleConfirm() {
    if (!props.fattura)
      return;
    await execute({ id: props.fattura.id, stato: FatturaStato.ANNULLATA });
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Annulla Fattura"
      confirmText="Conferma"
      onConfirm={handleConfirm}
      onConfirmLoading={isPending}
      trigger={props.trigger || (
        <Button variant="secondary" size="sm">Annulla</Button>
      )}
    >
      <div className="space-y-4 text-muted-foreground">
        <p>Confermando, i tuoi ricavi verranno aggiornati e la fattura verrà contrassegnata come annullata.</p>
        <p>Verrá inoltre emessa una nota di credito all'Agenzia delle Entrate, notificando l'annullamento di questa fattura.</p>
        <p>Sei sicuro di voler procedere?</p>
      </div>
    </Modal>
  );
}
