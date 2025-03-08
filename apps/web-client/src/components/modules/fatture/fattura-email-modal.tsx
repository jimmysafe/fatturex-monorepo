"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { getFattura } from "@repo/database/queries/fatture";
import type { getPartitaIva } from "@repo/database/queries/partita-iva";
import type { ButtonProps } from "@repo/ui/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { generatePdf } from "@/pdf/generate";
import { sendFatturaEmail } from "@/server/actions/email";

export const FatturaEmailFormSchema = z.object({
  subject: z.string().min(1),
  to: z.string().email(),
  message: z.string().min(1),
});

export function FatturaEmailModal(props: {
  trigger?: React.ReactNode;
  triggerProps?: ButtonProps;
  fattura: Awaited<ReturnType<typeof getFattura>>;
}) {
  const { data } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);

  const { data: partitaIva, isLoading } = useQuery<Awaited<ReturnType<typeof getPartitaIva>>>({
    queryKey: ["partita-iva"],
    queryFn: () => fetch("/api/partita-iva").then(res => res.json()),
    enabled: isOpen,
  });

  const form = useForm<z.infer<typeof FatturaEmailFormSchema>>({
    resolver: zodResolver(FatturaEmailFormSchema),
    defaultValues: {
      to: props.fattura?.cliente.indirizzoEmail,
      subject: `${props.fattura?.user.nome} ${props.fattura?.user.cognome} - Fattura n. ${props.fattura?.numeroProgressivo}`,
      message: !props.fattura ? "" : `Gentile ${nominativoCliente(props.fattura?.cliente)},\n\nIn allegato puó trovare la nostra fattura n. ${props.fattura?.numeroProgressivo}.\n\nCordiali Saluti\n\n${props.fattura?.user.nome} ${props.fattura?.user.cognome}`,
    },
  });

  const { execute, isPending } = useServerAction(sendFatturaEmail, {
    onSuccess() {
      toast.success("Email inviata con successo");
      setIsOpen(false);
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function handleSubmit(values: z.infer<typeof FatturaEmailFormSchema>) {
    if (!data?.user || !props.fattura)
      return;
    const attachment = await generatePdf(props.fattura, partitaIva!, { email: data.user.email, cassa: data.user.cassa!, nome: data.user.nome!, cognome: data.user.cognome!, themeColor: data.user.themeColor, logoPath: data.user.logoPath }) as ArrayBuffer;
    return execute({
      ...values,
      fatturaId: props.fattura.id,
      fatturaBase64: Buffer.from(attachment).toString("base64"),
    });
  }

  if (isLoading)
    return <Skeleton className="h-[80px]" />;

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Email"
      confirmText="Invia"
      description="Invia al cliente un'email con fattura allegata."
      trigger={props.trigger || (
        <Button size="sm" {...props.triggerProps}>
          Invia Email
        </Button>
      )}
      onConfirmLoading={isPending}
      onConfirm={form.handleSubmit(handleSubmit)}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormFields.Input name="to" label="Destinatario" />
          <FormFields.Input name="subject" label="Oggetto" />
          <FormFields.TextArea name="message" label="Messaggio" className="min-h-[300px]" />
        </div>
      </Form>
    </Modal>
  );
}
