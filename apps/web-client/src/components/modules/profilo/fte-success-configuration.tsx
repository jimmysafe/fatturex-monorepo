"use client";

import { authClient } from "@repo/auth/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import type { FteApiConfigurationResponse } from "@/app/api/fte/api-configurations/route";
import type { _getPartitaIva } from "@/lib/cached/get-partita-iva";

import { fteSetupCallbacks } from "@/server/actions/fattura-elettronica";

export function FteSuccessConfiguration({ partitaIva }: { partitaIva: Awaited<ReturnType<typeof _getPartitaIva>> }) {
  const { data, isPending: authLoading } = authClient.useSession();

  const { execute: setup, isPending } = useServerAction(fteSetupCallbacks, {
    onError({ err }) {
      toast.error(err.message);
    },
    onSuccess() {
      toast.success("Setup salvato con successo");
    },
  });

  const configQuery = useQuery<FteApiConfigurationResponse>({
    queryKey: ["fte-setup-callbacks", partitaIva?.numero],
    queryFn: async () => {
      const res = await fetch(`/api/fte/api-configurations?fiscal_id=${partitaIva?.numero}`);
      const data = await res.json();
      return data;
    },
  });

  async function handleSetup() {
    await setup();
    configQuery.refetch();
  }

  // @ts-expect-error cant type impersonateBy
  if ((authLoading || !data?.session?.impersonatedBy) && data?.user.role !== "admin")
    return null;

  if (configQuery.isLoading)
    return <Skeleton className="h-10 w-full" />;

  return (
    <div className="space-y-2">

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger><pre className="text-xs text-muted-foreground">Configurazione Notifiche</pre></AccordionTrigger>
          <AccordionContent className="space-y-4 text-xs text-muted-foreground">
            <pre>
              ID:
              {partitaIva?.fteConfigurationId}
            </pre>
            <div>
              <pre>Api Configuration Endpoints</pre>
              <Separator className="my-2" />
              {configQuery.data?.data.map(item => (
                <div key={item.id} className="mb-2 flex flex-col gap-1">
                  <pre>
                    {item.callback.event}
                    :
                  </pre>
                  <pre>{item.callback.url}</pre>
                </div>
              ))}
              <Button loading={isPending} size="sm" variant="outline" onClick={handleSetup}>
                Aggiorna
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  // <div className="space-y-2">
  //   <FteDeactivateButton
  //     variant={'outline'}
  //     className="w-full"
  //   >
  //     <Link className="mr-2 h-4 w-4" />
  //     Disattiva Fattura Elettronica
  //   </FteDeactivateButton>
  //   <p className="text-[0.8rem] text-muted-foreground">Nonm potrai inviare le fatture all&apos;Agenzia delle Entrate.</p>
  // </div>
  );
}
