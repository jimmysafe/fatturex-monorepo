"use client";
import type { getCliente } from "@repo/database/queries/clienti";

import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { Card } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { ChevronRight, UserIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ClienteCard(
  cliente: Awaited<ReturnType<typeof getCliente>>,
) {
  const { anno } = useParams<{ anno: string }>();
  if (!cliente)
    return null;
  return (
    <Link href={`/${anno}/clienti/${cliente.id}`} className="group">
      <Card className={cn("w-full text-sm font-semibold bg-card leading-none tracking-tight text-left p-4 border dark:border-muted border-gray-100 rounded-md flex items-center gap-4 group-hover:translate-x-1 duration-200")}>
        <UserIcon className="size-8 text-gray-200" />
        <div className="flex-1">
          <p className="text-primary">
            {" "}
            { nominativoCliente(cliente) }
          </p>
          <div className="py-2 text-xs text-muted-foreground">
            <p>
              P.IVA
              {" "}
              {cliente.partitaIva || "-"}
            </p>
            <p>
              CF
              {" "}
              {cliente.codiceFiscale || "-"}
            </p>
          </div>
          <p className="text-xs">
            {cliente.comune}
            {" "}
            (
            {cliente.provincia}
            ) -
            {" "}
            {cliente.indirizzo || "-"}
          </p>
        </div>
        <div className="flex items-center justify-end">
          <ChevronRight className="size-6 text-primary" />
        </div>

      </Card>
    </Link>
  );
}
