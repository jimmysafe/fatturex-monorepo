"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import type { getFattura } from "@repo/database/queries/fatture";
import type { getPartitaIva } from "@repo/database/queries/partita-iva";
import type { Cliente, Fattura, Indirizzo, PartitaIva } from "@repo/database/schema";

import { authClient } from "@repo/auth/client";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

import { generatePdf } from "@/pdf/generate";

interface FatturaPdfPreviewProps {
  fattura: Omit<Awaited<ReturnType<typeof getFattura>>, "user">;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Spinner = () => <Skeleton className="h-[402px] w-full" />;

function PdfPreview({ fattura }: FatturaPdfPreviewProps) {
  const { data: session, isPending } = authClient.useSession();
  const [file, setFile] = useState<File | ArrayBuffer | null>(null);
  const user = session?.user;

  const { data: partitaIva, isLoading: partitaIvaLoading } = useQuery<Awaited<ReturnType<typeof getPartitaIva>>>({
    queryKey: ["partita-iva"],
    queryFn: () => fetch("/api/partita-iva").then(res => res.json()),
  });

  useEffect(() => {
    (async () => {
      if (!user || !partitaIva)
        return;
      const pdf = await generatePdf(fattura as unknown as Fattura & { indirizzo: Indirizzo; cliente: Cliente }, partitaIva as unknown as PartitaIva, { email: user.email!, cassa: user.cassa!, nome: user.nome!, cognome: user.cognome!, logoPath: user.logoPath, themeColor: user.themeColor });
      setFile(pdf);
    })();
  }, [fattura, user, partitaIva]);

  if (isPending || !file || partitaIvaLoading)
    return <Spinner />;

  return (
    <Document
      loading={<Spinner />}
      error={<Spinner />}
      file={file}
      renderMode="canvas"
      className="fattura-pdf-preview"
    >
      <Page
        pageNumber={1}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </Document>
  );
}

export default PdfPreview;
