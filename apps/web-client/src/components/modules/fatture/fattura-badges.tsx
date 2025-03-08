"use client";
import type { FatturaStatoType, FteStatoType, StsStatoType } from "@repo/database/lib/enums";
import type { getFatture, getFattureCliente } from "@repo/database/queries/fatture";

import { authClient } from "@repo/auth/client";
import { FatturaStato, FteStato, StsStato, UserCassa } from "@repo/database/lib/enums";
import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from "@repo/ui/lib/utils";

import type { ArrayElement } from "@/server/types";

export function FatturaBadges({ fattura, className = "" }: { fattura: ArrayElement<Awaited<ReturnType<typeof getFatture | typeof getFattureCliente>>["data"]>; className?: string }) {
  const { data } = authClient.useSession();
  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      <FatturaStatoBadge stato={fattura.stato} />
      <FatturaFteStatoBadge stato={fattura.fteStato} />
      {data?.user?.cassa === UserCassa.ENPAP && (
        <FatturaStsStatoBadge stato={fattura.stsStato} />
      )}
    </div>
  );
}

export function FatturaStatoBadge({ stato }: { stato: FatturaStatoType }) {
  return (
    <Badge variant={
      stato === FatturaStato.ANNULLATA
        ? "destructive"
        : stato === FatturaStato.SALDATA
          ? "success"
          : "warning"
    }
    >
      { stato}
    </Badge>
  );
}

export function FatturaFteStatoBadge({ stato }: { stato: FteStatoType }) {
  return (
    <Badge variant={
      stato === FteStato.ANNULLATA
        ? "destructive"
        : stato === FteStato.INVIATA
          ? "success"
          : stato === FteStato.NON_INVIATA
            ? "warning"
            : "secondary"
    }
    >
      { stato}
    </Badge>
  );
}

export function FatturaStsStatoBadge({ stato }: { stato: StsStatoType }) {
  return (
    <Badge variant={
      stato === StsStato.CANCELLATA
        ? "destructive"
        : stato === StsStato.INVIATA
          ? "success"
          : "warning"
    }
    >
      STS:
      {" "}
      { stato}
    </Badge>
  );
}
