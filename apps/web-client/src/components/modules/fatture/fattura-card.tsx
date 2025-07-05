"use client";
import type { getFatture, getFattureCliente } from "@repo/database/queries/fatture";

import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { price } from "@repo/shared/price";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardTitle } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import { Calendar, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

import type { ArrayElement } from "@/server/types";

import { FatturaBadges } from "./fattura-badges";

export function FatturaCard(fattura: ArrayElement<Awaited<ReturnType<typeof getFatture | typeof getFattureCliente>>["data"]>) {
  const annoFattura = new Date(fattura.dataEmissione).getFullYear();
  const noteDiCredito = fattura.noteDiCredito;

  return (
    <Link href={`/${annoFattura}/fatture/${fattura.id}`} className="group">
      {noteDiCredito.map(n => (
        <div key={n.id} className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 duration-200 group-hover:translate-x-1 sm:p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100">
                <FileText className="size-4 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-amber-800">
                    {n.numeroProgressivo}
                    /
                    {annoFattura}
                    -NC
                  </span>
                  <Badge variant="default" className="bg-amber-200 text-amber-800 ">
                    {n.mode.charAt(0).toUpperCase() + n.mode.slice(1)}
                  </Badge>
                </div>
                {n.dataNotaCredito && (
                  <div className="mt-1 flex items-center space-x-1">
                    <Calendar className="size-3 shrink-0 text-amber-600" />
                    <span className="text-xs text-amber-700">
                      {format(n.dataNotaCredito, "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="flex flex-col sm:items-end">
                {n.mode === "parziale" && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-amber-600">Importo:</span>
                    <span className="text-sm font-bold text-amber-800">
                      {price(n.totale)}
                    </span>
                  </div>
                )}
                <div className="mt-1 flex items-center space-x-2 sm:justify-end">
                  <div className="size-2 animate-pulse rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium text-amber-700">
                    {n.fteStato}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Card className={cn("grid grid-cols-2 gap-y-4 p-4 duration-200 group-hover:translate-x-1 md:grid-cols-4 md:gap-2 md:p-6 z-10", { "rounded-t-none": noteDiCredito.length > 0 })}>
        <div className="flex items-start gap-1 md:items-center md:gap-4">
          <FileText className="hidden size-9 text-gray-200 md:block" />
          <div className="flex flex-col gap-1">
            <CardTitle>
              {fattura.numeroProgressivo}
              {" "}
              /
              {" "}
              {annoFattura}
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
