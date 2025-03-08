"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import type { getAnniContabilita } from "@repo/database/queries/contabilita";
import type { FattureExportSchema } from "@repo/database/schema";
import type { z } from "zod";

import { FatturaStato, FatturaStatoValues } from "@repo/database/lib/enums";
import { Button } from "@repo/ui/components/ui/button";
import { CredenzaDialog, CredenzaDialogBody, CredenzaDialogClose, CredenzaDialogContent, CredenzaDialogDescription, CredenzaDialogFooter, CredenzaDialogHeader, CredenzaDialogTitle, CredenzaDialogTrigger } from "@repo/ui/components/ui/credenza-dialog";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { useQuery } from "@tanstack/react-query";
import { DownloadIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { downloadFileBlob } from "@/lib/download";
import { exportFatture } from "@/server/actions/fatture";

export function FattureExportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { anno } = useParams<{ anno: string }>();

  const { data, isLoading } = useQuery<Awaited<ReturnType<typeof getAnniContabilita>>>({
    queryKey: ["list-anni"],
    queryFn: () => fetch("/api/contabilita").then(res => res.json()),
    enabled: isOpen,
  });
  const anniContabilita = data?.map(item => item.anno.toString()) || [];

  const form = useForm<z.infer<typeof FattureExportSchema>>({
    defaultValues: {
      anno,
      stato: FatturaStato.SALDATA,
      // fteStato: FteStato.INVIATA
    },
  });

  const { execute, isPending } = useServerAction(exportFatture, {
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleConfirm(data: z.infer<typeof FattureExportSchema>) {
    const [blob] = await execute(data);
    if (!blob)
      throw new Error("No data received");

    downloadFileBlob(blob, `Fatture-${data.anno}.zip`);
    setIsOpen(false);
  }

  if (isLoading)
    return <></>;

  return (
    <CredenzaDialog open={isOpen} onOpenChange={setIsOpen}>
      <CredenzaDialogTrigger asChild>
        <Button variant="ghost">
          <DownloadIcon />
          Esporta
        </Button>
      </CredenzaDialogTrigger>
      <CredenzaDialogContent className="w-full max-w-xl">
        <CredenzaDialogHeader>
          <CredenzaDialogTitle>Esporta</CredenzaDialogTitle>
          <CredenzaDialogDescription>Esporta le fatture in base ai seguenti metodi di ricerca.</CredenzaDialogDescription>
        </CredenzaDialogHeader>
        <CredenzaDialogBody>
          <Form {...form}>
            <form className="space-y-2">
              <FormFields.Select name="anno" label="Anno" options={anniContabilita.map(a => ({ label: a, value: a }))} />
              <FormFields.Select name="stato" label="Stato" options={FatturaStatoValues.map(s => ({ label: s, value: s }))} />
              {/* <FormFields.Select name="fteStato" label="Stato Fattura Elettronica" options={FteStatoValues.map(s => ({ label: s, value: s }))}  /> */}
            </form>
          </Form>
        </CredenzaDialogBody>
        <CredenzaDialogFooter>
          <CredenzaDialogClose asChild>
            <Button type="button" variant="outline" className="w-full">Annulla</Button>
          </CredenzaDialogClose>
          <Button loading={isPending} className="w-full" onClick={form.handleSubmit(handleConfirm)}>Esporta</Button>
        </CredenzaDialogFooter>
      </CredenzaDialogContent>
    </CredenzaDialog>
  );
}
