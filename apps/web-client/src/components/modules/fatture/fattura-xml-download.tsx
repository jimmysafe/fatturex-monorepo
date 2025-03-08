"use client";
import type { getFattura } from "@repo/database/queries/fatture";
import type { getPartitaIva } from "@repo/database/queries/partita-iva";

import { toast } from "sonner";

import { buildXml } from "@/server/actions/fattura-elettronica/builder";

export function FatturaXmlDownload(
  { fattura, partitaIva }: { fattura: Awaited<ReturnType<typeof getFattura>>; partitaIva: Awaited<ReturnType<typeof getPartitaIva>> },
) {
  if (!fattura || !partitaIva)
    return null;

  const handleDownload = () => {
    const text = buildXml({
      fattura,
      cliente: fattura.cliente,
      partitaIva,
      nomeUtente: "asdasd",
      tipoDocumento: "TD01",
    });

    const blob = new Blob([text], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fattura-${fattura.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Fattura XML scaricata con successo");
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0"
    >
      Download XML
    </button>
  );
}
