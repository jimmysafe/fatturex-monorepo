import { getCliente } from "@repo/database/queries/clienti";
import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { notFound } from "next/navigation";

import { ClienteActions } from "@/components/modules/clienti/cliente-actions";
import ClienteFatture from "@/components/modules/clienti/cliente-fatture";
import { ClienteInfoCard } from "@/components/modules/clienti/cliente-info-card";
import { session } from "@/lib/session";

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const { user } = await session();
  const cliente = await getCliente(id, user.id);
  if (!cliente)
    return notFound();

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-8 lg:items-center">
        <h1 className="text-lg font-bold">{nominativoCliente(cliente)}</h1>
        <ClienteActions {...cliente} />
      </div>
      <ClienteInfoCard {...cliente} />
      <ClienteFatture />
    </section>
  );
}
