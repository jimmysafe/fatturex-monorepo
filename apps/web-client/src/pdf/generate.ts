import type { FatturaMetodoPagamentoType, FatturaPreferenzaDataSaldoType, UserCassaType } from "@repo/database/lib/enums";
import type { Cliente, FatturaArticolo, Indirizzo, PartitaIva } from "@repo/database/schema";
import type { TextOptionsLight } from "jspdf";
import type { autoTable, Table } from "jspdf-autotable";

import { FatturaMetodoPagamento, FatturaPreferenzaDataSaldo } from "@repo/database/lib/enums";
import { PRIMARY_COLOR } from "@repo/shared/const";
import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { price } from "@repo/shared/price";
import { format } from "date-fns";
import { jsPDF as JsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";

import { env } from "@/env";
import { formatAddress } from "@/lib/address";

import RobotoBold from "./font/bold";
import RobotoRegular from "./font/regular";
import { pdfLocales } from "./locales";
import { getUnitPrice } from "./utils";

applyPlugin(JsPDF);

interface BlockTextContent {
  text: string;
  options?: TextOptionsLight;
};

async function getImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:image/${imageUrl.split(".").pop()};base64,${buffer.toString("base64")}`;
}

export interface FatturaGeneratedArgs {
  indirizzo: Indirizzo;
  cliente: Cliente;
  numeroProgressivo: number;
  dataEmissione: Date;
  preferenzaDataSaldo: FatturaPreferenzaDataSaldoType;
  metodoPagamento: FatturaMetodoPagamentoType;
  idMarcaDaBollo: string | null;
  addebitaMarcaDaBollo: boolean | null;
  contributo: number | null;
  parzialeFattura: number;
  totaleFattura: number;
  articoli: FatturaArticolo[];
  lingua: string;
  addebitaContributo: boolean | null;
}

export async function generatePdf(
  fattura: FatturaGeneratedArgs & { indirizzo: Indirizzo; cliente: Cliente },
  partitaIva: PartitaIva,
  user: { email: string; cassa: UserCassaType; nome: string; cognome: string; logoPath?: string | null; themeColor?: string | null },
  tipoFattura: "TD01" | "TD04" = "TD01",
) {
  const isFattura = tipoFattura === "TD01";
  const margin = 20;

  const r = 210 - margin;
  const l = 0 + margin;
  let y = 20;

  const docWidth = 210 - (margin * 2);
  const colWidth = docWidth / 2;

  const spaceYMini = 2;
  const spaceYSmall = 5;
  const spaceYMedium = 15;
  const spaceYLarge = 30;

  const fontFamily = "Roboto";
  const fontSize = 11;

  const locale = pdfLocales[fattura.lingua]!;

  const doc = new JsPDF({ filters: ["ASCIIHexEncode"] }) as JsPDF & { autoTable: autoTable };

  doc.setTextColor(92, 92, 92);

  doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

  doc.addFileToVFS("Roboto-Bold.ttf", RobotoBold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

  doc.setFont(fontFamily);
  doc.setFontSize(fontSize);

  const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;

  function block(content: (BlockTextContent | null)[], x: number, y: number, w: number, _options?: TextOptionsLight) {
    let height = y;
    content.forEach((c) => {
      if (!c)
        return;
      const { text: t, options } = c;
      const value = text(t, x, height, w, { ..._options, ...options });
      height += value.height;
    });
    return {
      height: height - y,
    };
  }

  function text(txt: string, x: number, y: number, w: number, options?: TextOptionsLight & { size?: number }) {
    if (options?.size)
      doc.setFontSize(options.size);
    const value = doc.splitTextToSize(txt, w);
    const [line] = value;
    const vals = line.split("**");
    let xPos = x;
    if (options?.align === "right")
      vals.reverse();

    vals.forEach((v: string, i: number) => {
      if (i % 2 === 0) {
        doc.setFont(fontFamily, "normal");
      }
      else { doc.setFont(fontFamily, "bold"); }
      doc.text(v, xPos, y, options);
      const txtWidth = (doc.getStringUnitWidth(v) / doc.internal.scaleFactor) * fontSize;
      xPos = options?.align === "right" ? xPos - txtWidth : xPos + txtWidth;
    });
    if (options?.size)
      doc.setFontSize(fontSize);
    return {
      value,
      lines: value.length,
      height: lineHeight * value.length,
    };
  }

  if (user.logoPath) {
    const ext = user.logoPath.split(".").pop()!;
    const remoteImageUrl = `${env.NEXT_PUBLIC_BUCKET_URL}${user.logoPath}`;
    const image = await getImageAsBase64(remoteImageUrl);
    doc.addImage(image, ext?.toUpperCase(), l, y, 20, 20);
  }
  else {
    text(`${isFattura ? locale.fattura : locale.nota_di_credito}`, l, y, colWidth, { size: 20 });
  }

  const nome = text(`${user.nome} ${user.cognome}`, r, y, colWidth, { align: "right" });
  y += nome.height + spaceYSmall;

  const infoBlock = block([
    { text: `**${locale.partita_iva}:** ${partitaIva.numero}` },
    { text: `**${locale.codice_fiscale}:** ${partitaIva.codiceFiscale}` },
    { text: formatAddress(fattura.indirizzo) },
    { text: `**Email**: ${user.email}` },
  ], r, y, colWidth, { align: "right" });

  y += infoBlock.height + spaceYLarge;

  const numeroText = isFattura
    ? `**${locale.numero_fattura}:** ${fattura.numeroProgressivo}/${new Date(fattura.dataEmissione).getFullYear()}`
    : `**${locale.nota_di_credito}:** ${fattura.numeroProgressivo}/${new Date(fattura.dataEmissione).getFullYear()}-NC`;

  const dataText = isFattura ? locale.data_emissione : locale.data_nota_di_credito;

  block([
    { text: numeroText },
    { text: `**${dataText}:** ${format(fattura.dataEmissione, "dd/MM/yyyy")}` },
    fattura.preferenzaDataSaldo !== FatturaPreferenzaDataSaldo.IMMEDIATO ? { text: `${locale.preferenza_data_saldo} ${fattura.preferenzaDataSaldo} ${locale.giorni}` } : null,
  ], r, y, colWidth, { align: "right" });

  const destinatarioLabel = text(`${locale.destinatario}`, l, y, colWidth, { size: 8 });

  y += destinatarioLabel.height + spaceYMini;

  const destinatarioBlock = block([
    { text: `**${nominativoCliente(fattura.cliente)}**` },
    { text: formatAddress(fattura.cliente) },
    { text: `**Email**: ${fattura.cliente.indirizzoEmail}` },
    { text: `**${locale.partita_iva}**: ${fattura.cliente.partitaIva}` },
  ], l, y, colWidth);

  y += destinatarioBlock.height + spaceYMedium;

  const table = doc.autoTable({
    styles: {
      fontSize,
    },
    margin: { left: margin, right: margin, top: y },
    headStyles: {
      fontSize: 9,
      fillColor: user.themeColor || PRIMARY_COLOR,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
    },
    head: [[`${locale.descrizione}`, `${locale.costo_unitario}`, `${locale.quantita}`, `${locale.importo}`]],
    body: fattura.articoli.map((a) => {
      const p = getUnitPrice(a, fattura, user.cassa);
      return [a.descrizione, price(p), a.quantita, price(p * a.quantita)];
    }),
  });

  const previousTable = (table as any).previousAutoTable as Table;
  y = (previousTable.finalY || 0) + spaceYMedium;

  const legal1 = doc.splitTextToSize(`${locale.legal_note_1}`, docWidth);
  if (isFattura) {
    doc.text(legal1, l, y);
    y += lineHeight * legal1.length + spaceYSmall;
  }

  if (isFattura) {
    const legal2 = doc.splitTextToSize(`${locale.legal_note_2}`, docWidth);
    doc.text(legal2, l, y);
    y += lineHeight * legal2.length + spaceYLarge;
  }

  const hasMarcaDaBollo = fattura.parzialeFattura + (fattura.contributo ?? 0) > 77.46;
  const hasAddebitaMarcaDaBollo = hasMarcaDaBollo && fattura.addebitaMarcaDaBollo;

  if (isFattura) {
    block([
      fattura.metodoPagamento === FatturaMetodoPagamento.BONIFICO ? { text: `**IBAN**: ${partitaIva.iban || "-"}` } : null,
      fattura.metodoPagamento === FatturaMetodoPagamento.BONIFICO ? { text: `**${locale.intestatario_iban}**: ${partitaIva.ibanIntestatario || "-"}` } : null,
      fattura.metodoPagamento === FatturaMetodoPagamento.BONIFICO ? { text: `**${locale.banca}**: ${partitaIva.ibanBanca || "-"}` } : null,
      fattura.metodoPagamento === FatturaMetodoPagamento.CARTA ? { text: `**${locale.metodo_pagamento_carta}**` } : null,
      hasMarcaDaBollo ? { text: `**${locale.id_marca_da_bollo}:** ${fattura.idMarcaDaBollo ?? "-"}` } : null,
    ], l, y, colWidth);
  }

  const totali = [
    { text: `**${locale.imponibile}:** ${price(fattura.parzialeFattura)}` },
    // { text: `**${locale.contributo} (${getCassaText(user.cassa)}):** ${price(fattura.contributo || 0)}` },
    { text: `**${locale.contributo}:** ${price(fattura.contributo || 0)}` },
    hasAddebitaMarcaDaBollo ? { text: `**${locale.marca_da_bollo}:** ${price(2)}` } : null,
  ];

  const totaliBlock = block(totali, r, y, colWidth, { align: "right" });
  y += totaliBlock.height + spaceYSmall;

  text(`${price(fattura.totaleFattura)}`, r, y, colWidth, { size: 20, align: "right" });

  const output = doc.output("arraybuffer");
  return output;
}
