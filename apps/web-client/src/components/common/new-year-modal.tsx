"use client";

import { useState } from "react";

import { Button } from "@repo/ui/components/ui/button";
import { CredenzaDialog, CredenzaDialogBody, CredenzaDialogContent, CredenzaDialogDescription, CredenzaDialogHeader, CredenzaDialogTitle } from "@repo/ui/components/ui/credenza-dialog";
import { RocketIcon } from "lucide-react";
import { useServerAction } from "zsa-react";

import { createContabilita } from "@/server/actions/contabilita";

export function NewYearModal() {
  const [open, setOpen] = useState(true);

  const { execute, isPending } = useServerAction(createContabilita, {
    onSuccess: () => {
      setOpen(false);
    },
  });

  return (
    <CredenzaDialog open={open}>
      <CredenzaDialogContent className="w-full" closeable={false}>
        <CredenzaDialogHeader>
          <CredenzaDialogTitle>Bentornato!</CredenzaDialogTitle>
          <CredenzaDialogDescription>
            Inizializza la nuova contabilità per l'anno
            {new Date().getFullYear()}
            .
          </CredenzaDialogDescription>
        </CredenzaDialogHeader>
        <CredenzaDialogBody>
          <div className="flex w-full flex-col items-stretch gap-2 md:flex-row">
            <Button loading={isPending} onClick={() => execute({ anno: new Date().getFullYear() })} className="w-full">
              { !isPending && <RocketIcon />}
              Inizializza
            </Button>
          </div>
        </CredenzaDialogBody>
      </CredenzaDialogContent>
    </CredenzaDialog>
  );
}
