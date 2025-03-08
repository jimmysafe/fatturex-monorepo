import type { getCliente } from "@repo/database/queries/clienti";

import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { TextRow } from "@repo/ui/components/ui/text-row";

import { formatAddress } from "@/lib/address";

export function ClienteInfoCard(
  cliente: Awaited<ReturnType<typeof getCliente>>,
) {
  if (!cliente)
    return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextRow
          variant="stacked"
          label="Nominativo"
          value={nominativoCliente(cliente)}
        />
        <TextRow
          variant="stacked"
          label="Indirizzo Email"
          value={cliente.indirizzoEmail}
        />
        <TextRow
          variant="stacked"
          label="Indirizzo PEC"
          value={cliente.indirizzoPec}
        />
        <TextRow
          variant="stacked"
          label="Partita IVA"
          value={cliente.partitaIva}
        />
        <TextRow
          variant="stacked"
          label="Codice Fiscale"
          value={cliente.codiceFiscale}
        />
        <TextRow
          variant="stacked"
          label="Codice Destinatario SDI"
          value={cliente.codiceDestinatario}
        />
        <TextRow
          variant="stacked"
          label="Indirizzo"
          value={formatAddress(cliente)}
        />
        <TextRow
          variant="stacked"
          label="Telefono"
          value={cliente.telefono}
        />
        <TextRow
          variant="stacked"
          label="Telefono Fisso"
          value={cliente.telefonoFisso}
        />
      </CardContent>
    </Card>
  );
}
