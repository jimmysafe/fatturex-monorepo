"use client";
import type { getClientiRecenti } from "@repo/database/queries/clienti";

import { price } from "@repo/shared/price";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { ArrayElement } from "@/server/types";

import { formatAddress } from "@/lib/address";

export function ClienteDashboardCard(cliente: ArrayElement<Awaited<ReturnType<typeof getClientiRecenti>>>) {
  const { anno } = useParams<{ anno: string }>();
  return (
    <Link href={`/${anno}/clienti/${cliente.id}`} className="group flex items-center gap-6">
      <div className="ml-2 space-y-1">
        <p className="line-clamp-1 text-sm font-medium leading-none duration-200 group-hover:ml-1">{cliente.nominativo}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          { formatAddress(cliente) }
        </p>
      </div>
      <div className="ml-auto font-medium">
        +
        { price(cliente.ricavo)}
      </div>
    </Link>
  );
}
