"use client";
import { use } from "react";

import type { getFattura } from "@repo/database/queries/fatture";
import type { getPartitaIva } from "@repo/database/queries/partita-iva";
import type { getUserSubscription } from "@repo/database/queries/subscription";

import { authClient } from "@repo/auth/client";
import { FatturaStato, FteStato, UserCassa } from "@repo/database/lib/enums";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { UpgradeModal } from "../abbonamento/upgrade-modal";
import { FatturaAnnullaModal } from "./fattura-annulla-modal";
import { FatturaDeleteModal } from "./fattura-delete-modal";
import { FatturaEmailModal } from "./fattura-email-modal";
import { FatturaFteInvioModal } from "./fattura-fte-invio-modal";
import { SaldaFatturaModal } from "./fattura-salda-modal";
import { FatturaStsInvioModal } from "./fattura-sts-invio-modal";
import { FatturaXmlDownload } from "./fattura-xml-download";

export function FatturaActions(
  { subscriptionPromise, partitaIvaPromise, fattura }: { fattura: Awaited<ReturnType<typeof getFattura>>; subscriptionPromise: ReturnType<typeof getUserSubscription>; partitaIvaPromise: ReturnType<typeof getPartitaIva> },
) {
  const { data } = authClient.useSession();
  const { anno } = useParams<{ anno: string }>();
  const subscription = use(subscriptionPromise);
  const partitaIva = use(partitaIvaPromise);

  if (!fattura)
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
        {fattura.fteStato === FteStato.NON_INVIATA && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/${anno}/fatture/${fattura.id}/modifica`}>
                Modifica
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <FatturaDeleteModal
                fatturaId={fattura.id}
                trigger={
                  <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Elimina</div>
                }
              />
            </DropdownMenuItem>
          </>
        )}
        {fattura.stato === FatturaStato.EMESSA && (
          <DropdownMenuItem asChild>
            <SaldaFatturaModal
              fattura={fattura}
              trigger={
                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Salda</div>
              }
            />
          </DropdownMenuItem>
        )}
        {
          fattura.fteStato === FteStato.INVIATA && (
            <DropdownMenuItem asChild>
              <FatturaAnnullaModal
                fattura={fattura}
                trigger={
                  <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Annulla</div>
                }
              />
            </DropdownMenuItem>
          )
        }
        <DropdownMenuItem asChild>
          <Link href={`/api/fatture/${fattura.id}/pdf`} target="_blank">
            Visualizza PDF
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <FatturaEmailModal
            fattura={fattura}
            trigger={
              <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Invia Email</div>
            }
          />
        </DropdownMenuItem>
        {fattura.fteStato !== FteStato.ANNULLATA && fattura.fteStato !== FteStato.INVIATA && fattura.fteStato !== FteStato.PROCESSING && (
          <DropdownMenuItem asChild>
            {subscription?.fteEnabled
              ? (
                  <FatturaFteInvioModal
                    id={fattura.id}
                    trigger={
                      <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Firma e Invia</div>
                    }
                  />
                )
              : (
                  <UpgradeModal
                    trigger={
                      <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Firma e Invia</div>
                    }
                  />
                )}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <FatturaXmlDownload fattura={fattura} partitaIva={partitaIva} />
        </DropdownMenuItem>
        {data?.user.cassa === UserCassa.ENPAP && (
          <DropdownMenuItem asChild>
            <FatturaStsInvioModal
              fattura={fattura}
              trigger={
                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">Invia a STS</div>
              }
            />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
