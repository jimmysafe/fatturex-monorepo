import { calcolaTotaliFattura } from "@repo/database/lib/math";
import { getNotaDiCredito } from "@repo/database/queries/nota-credito";
import { getPartitaIva } from "@repo/database/queries/partita-iva";
import { v4 as uuidv4 } from "uuid";

import { parseRequest } from "@/lib/request";
import { notFound, serverError } from "@/lib/response";
import { generatePdf } from "@/pdf/generate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { user, error } = await parseRequest(request);
    if (error)
      return error();

    const partitaIva = await getPartitaIva(user!.id);
    if (!partitaIva)
      return notFound();

    const notaDiCredito = await getNotaDiCredito(id, user!.id);
    if (!notaDiCredito)
      return notFound();

    const usr = {
      ...user!,
      cassa: user!.cassa!,
      nome: user!.nome!,
      cognome: user!.cognome!,
    };

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

    const totaleFattura = calcolaTotaliFattura(articoli, { ...notaDiCredito.fattura, noteDiCredito: [] }, user!.cassa!).totaleFattura;

    const pdf = await generatePdf({
      ...notaDiCredito.fattura,
      dataEmissione: notaDiCredito.dataNotaCredito ?? new Date(),
      numeroProgressivo: notaDiCredito.numeroProgressivo,
      parzialeFattura: notaDiCredito.mode === "totale" ? notaDiCredito.fattura.parzialeFattura : notaDiCredito.totale,
      totaleFattura,
      articoli,
    }, partitaIva, usr, "TD04");

    const anno = notaDiCredito.dataNotaCredito?.getFullYear();

    return new Response(pdf, {
      headers: {
        "Content-Disposition": `inline; filename="${notaDiCredito.numeroProgressivo}-${anno}-NC.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
