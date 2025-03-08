import { getFattura } from "@repo/database/queries/fatture";
import { getPartitaIva } from "@repo/database/queries/partita-iva";

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

    const fattura = await getFattura(id, user!.id);
    if (!fattura)
      return notFound();

    const usr = {
      ...user!,
      cassa: user!.cassa!,
      nome: user!.nome!,
      cognome: user!.cognome!,
    };

    const pdf = await generatePdf(fattura, partitaIva, usr);

    const anno = fattura.dataSaldo ? fattura.dataSaldo.getFullYear() : fattura.dataEmissione.getFullYear();

    return new Response(pdf, {
      headers: {
        "Content-Disposition": `inline; filename="${fattura.numeroProgressivo}-${anno}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
