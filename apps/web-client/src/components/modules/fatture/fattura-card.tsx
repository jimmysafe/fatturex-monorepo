"use client";
import type { getFatture, getFattureCliente } from "@repo/database/queries/fatture";

import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { price } from "@repo/shared/price";
import { Card, CardTitle } from "@repo/ui/components/ui/card";
import { format } from "date-fns";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { ArrayElement } from "@/server/types";

import { FatturaBadges } from "./fattura-badges";

export function FatturaCard(fattura: ArrayElement<Awaited<ReturnType<typeof getFatture | typeof getFattureCliente>>["data"]>) {
  const { anno } = useParams<{ anno: string }>();

  return (
    <Link href={`/${anno}/fatture/${fattura.id}`} className="group">
      <Card className="grid grid-cols-2 gap-y-4 p-4 duration-200 group-hover:translate-x-1 md:grid-cols-4 md:gap-2 md:p-6">
        <div className="flex items-start gap-1 md:items-center md:gap-4">
          <FileText className="hidden size-9 text-gray-200 md:block" />
          <div className="flex flex-col gap-1">
            <CardTitle>
              {fattura.numeroProgressivo}
              {" "}
              /
              {" "}
              {anno}
            </CardTitle>
            <p className="text-xs font-medium text-muted-foreground">{format(fattura.dataEmissione, "dd/MM/yyyy")}</p>
          </div>
        </div>
        <FatturaBadges fattura={fattura} className="items-start justify-end md:items-center md:justify-start" />
        <div className="flex items-center">
          <p className="line-clamp-1 text-sm font-medium text-muted-foreground">{nominativoCliente(fattura.cliente)}</p>
        </div>
        <div className="flex items-center justify-end gap-2 md:gap-6">
          <p className="font-bold">{price(fattura.totaleFattura)}</p>
          <div className="flex items-center justify-end">
            <ChevronRight className="size-6 text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
