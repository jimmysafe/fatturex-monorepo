"use client";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import type { getFattura } from "@repo/database/queries/fatture";
import type { getPartitaIva } from "@repo/database/queries/partita-iva";
import type { Cliente, Fattura, Indirizzo, PartitaIva } from "@repo/database/schema";

import { Skeleton } from "@repo/ui/components/ui/skeleton";

import type { AuthUser } from "@/server/types";

import { generatePdf } from "@/pdf/generate";

interface FatturaPdfPreviewProps {
  fattura: Omit<Awaited<ReturnType<typeof getFattura>>, "user">;
  partitaIva: Awaited<ReturnType<typeof getPartitaIva>>;
  user: AuthUser;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Spinner = () => <Skeleton className="h-[402px] w-full" />;

export function PdfPreview({ fattura, partitaIva, user }: FatturaPdfPreviewProps) {
  const [file, setFile] = useState<File | ArrayBuffer | null>(null);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  useEffect(() => {
    (async () => {
      setFile(null);
      if (user && partitaIva && fattura) {
        const pdf = await generatePdf(fattura as unknown as Fattura & { indirizzo: Indirizzo; cliente: Cliente }, partitaIva as unknown as PartitaIva, { email: user.email!, cassa: user.cassa!, nome: user.nome!, cognome: user.cognome!, logoPath: user.logoPath, themeColor: user.themeColor });
        setFile(pdf);
      }
    })();
  }, [fattura, user, partitaIva]);

  if (!file)
    return <Spinner />;

  return (
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
  );
}
