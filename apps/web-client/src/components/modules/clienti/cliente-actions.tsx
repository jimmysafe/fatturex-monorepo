"use client";
import type { getCliente } from "@repo/database/queries/clienti";

import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ClienteUpdateModal } from "./cliente-update-modal";

export function ClienteActions(
  cliente: Awaited<ReturnType<typeof getCliente>>,
) {
  const { anno } = useParams<{ anno: string }>();
  if (!cliente)
    return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          Azioni
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <ClienteUpdateModal
            id={cliente.id}
            trigger={
              <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Modifica</div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${anno}/fatture/nuova?cid=${cliente.id}`}>
            Nuova Fattura
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
