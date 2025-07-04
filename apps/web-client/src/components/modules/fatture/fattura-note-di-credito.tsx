"use client";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import type { AuthUser } from "@repo/auth";
import type { UserCassaType } from "@repo/database/lib/enums";
import type { getFatturaNoteDiCredito } from "@repo/database/queries/nota-credito";
import type { getPartitaIva } from "@repo/database/queries/partita-iva";

import { calcolaTotaliFattura } from "@repo/database/lib/math";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/components/ui/carousel";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

import { FatturaFteStatoBadge } from "@/components/modules/fatture/fattura-badges";
import { generatePdf } from "@/pdf/generate";

export function FatturaNoteDiCredito({ noteDiCredito, partitaIva, user }: {
  noteDiCredito: Awaited<ReturnType<typeof getFatturaNoteDiCredito>>;
  partitaIva: Awaited<ReturnType<typeof getPartitaIva>>;
  user: AuthUser;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Note di credito</CardTitle>
        <CardDescription>
          Note di credito relative alla fattura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {noteDiCredito.map((notaDiCredito, index) => (
              <CarouselItem key={notaDiCredito.id} className="md:basis-1/2 lg:basis-1/3">
                <NotaDiCreditoCard notaDiCredito={notaDiCredito} partitaIva={partitaIva} user={user} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  );
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Spinner = () => <Skeleton className="h-[402px] w-full" />;

function NotaDiCreditoCard({ notaDiCredito, partitaIva, user }: {
  notaDiCredito: Awaited<ReturnType<typeof getFatturaNoteDiCredito>>[number];
  partitaIva: Awaited<ReturnType<typeof getPartitaIva>>;
  user: AuthUser;
}) {
  const [file, setFile] = useState<File | ArrayBuffer | null>(null);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  useEffect(() => {
    (async () => {
      setFile(null);
      if (user && partitaIva && notaDiCredito.fattura) {
        const articoli = [
          {
            prezzo: notaDiCredito.mode === "totale" ? notaDiCredito.fattura.parzialeFattura : notaDiCredito.totale,
            quantita: 1,
            descrizione: "Storno per errata fatturazione",
            fatturaId: notaDiCredito.fatturaId,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const totaleFattura = calcolaTotaliFattura(articoli, { ...notaDiCredito.fattura, noteDiCredito: [] }, user!.cassa! as UserCassaType).totaleFattura;

        const pdf = await generatePdf(
          {
            ...notaDiCredito.fattura,
            dataEmissione: notaDiCredito.dataNotaCredito ?? new Date(),
            numeroProgressivo: notaDiCredito.numeroProgressivo,
            parzialeFattura: notaDiCredito.mode === "totale" ? notaDiCredito.fattura.parzialeFattura : notaDiCredito.totale,
            totaleFattura,
            articoli,
          },
          partitaIva as unknown as any,
          { email: user.email!, cassa: user.cassa! as UserCassaType, nome: user.nome!, cognome: user.cognome!, logoPath: user.logoPath, themeColor: user.themeColor },
          "TD04",
        );
        setFile(pdf);
      }
      setIsDocumentReady(true);
    })();
  }, [notaDiCredito.fattura, user, partitaIva]);

  if (!file)
    return <Spinner />;

  return (
    <div className="group relative rounded bg-muted p-1">
      <div className="flex items-center justify-between pb-2">
        <div className="px-2">
          <p className="text-xs font-bold">
            {notaDiCredito.numeroProgressivo}
            -NC
          </p>
        </div>
        <FatturaFteStatoBadge stato={notaDiCredito.fteStato} />
      </div>
      <Document
        error={<Spinner />}
        loading={<Spinner />}
        onError={console.error}
        onLoadSuccess={() => setIsDocumentReady(true)}
        file={file}
        renderMode="canvas"
        className="fattura-pdf-preview"
      >
        {isDocumentReady
          && (
            <Page
              pageNumber={1}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          )}

      </Document>

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded bg-black bg-opacity-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Link href={`/api/note-di-credito/${notaDiCredito.id}/pdf`} target="_blank">
          <Button variant="outline">
            <ExternalLink className="size-4" />
            Visualizza
          </Button>
        </Link>
      </div>
    </div>
  );
}
