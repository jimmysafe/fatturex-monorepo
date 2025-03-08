"use client";
import { useFormContext } from "react-hook-form";

import type { getCliente } from "@repo/database/queries/clienti";

import { CreateFatturaSchema } from "@repo/database/schema";
import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, RefreshCw, SearchIcon } from "lucide-react";

import { ClienteCreateModal } from "../../clienti/cliente-create-modal";
import { ClientiSelectModal } from "../../clienti/clienti-select-modal";

export const FatturaClienteSchema = CreateFatturaSchema.pick({ clienteId: true });

export function Cliente() {
  const form = useFormContext();
  const clienteId = form.watch("clienteId");

  const { data, isLoading } = useQuery<Awaited<ReturnType<typeof getCliente>>>({
    queryKey: ["clienti", clienteId],
    queryFn: () => fetch(`/api/clienti/${clienteId}`).then(res => res.json()),
    enabled: !!clienteId,
  });

  if (!clienteId) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6">
        <ClientiSelectModal trigger={(
          <Button variant="outline" className="w-full bg-card py-6">
            <SearchIcon />
            Cerca Cliente
          </Button>
        )}
        />
        <div className="mx-auto flex w-full max-w-sm items-center gap-2 py-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">oppure</span>
          <Separator className="flex-1" />
        </div>
        <ClienteCreateModal
          trigger={(
            <Button variant="outline" className="w-full bg-card py-6">
              <PlusIcon />
              Nuovo Cliente
            </Button>
          )}
          onConfirm={data => form.setValue("clienteId", data.id)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-1">
        <ClientiSelectModal trigger={(
          <Button variant="ghost" size="sm">
            <RefreshCw />
            Cambia Cliente
          </Button>
        )}
        />
        <ClienteCreateModal
          trigger={(
            <Button variant="ghost" size="sm">
              <PlusIcon />
              Nuovo Cliente
            </Button>
          )}
          onConfirm={data => form.setValue("clienteId", data.id)}
        />
      </div>
      {
        isLoading
          ? (
              <Skeleton className="h-[82px] w-full" />
            )
          : data
            ? (
                <Card className="flex w-full items-center gap-4 rounded-md border border-gray-100 bg-card p-4 text-left text-sm font-semibold leading-none tracking-tight duration-200 dark:border-muted">
                  <div className="flex-1">
                    <p className="text-primary">
                      {" "}
                      { nominativoCliente(data) }
                    </p>
                    <div className="py-2 text-xs text-muted-foreground">
                      <p>
                        P.IVA
                        {" "}
                        {data.partitaIva || "-"}
                      </p>
                      <p>
                        CF
                        {" "}
                        {data.codiceFiscale || "-"}
                      </p>
                    </div>
                    <p className="text-xs">
                      {data.comune}
                      {" "}
                      (
                      {data.provincia}
                      ) -
                      {" "}
                      {data.indirizzo || "-"}
                    </p>
                  </div>
                </Card>
              )
            : (
                <p className="text-sm text-muted-foreground">Nessun cliente selezionato</p>
              )
      }
    </div>
  );
}
