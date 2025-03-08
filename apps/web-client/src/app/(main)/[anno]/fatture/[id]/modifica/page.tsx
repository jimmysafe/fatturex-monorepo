import type { UserCassaType } from "@repo/database/lib/enums";

import { getFattura } from "@repo/database/queries/fatture";
import { getIndirizzi } from "@repo/database/queries/indirizzi";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { notFound } from "next/navigation";

import { ModificaFattura } from "@/components/modules/fatture/modifica-fattura";
import { session } from "@/lib/session";

export default async function ModificaFatturaPage(props: { params: Promise<{ id: string; anno: string }> }) {
  const params = await props.params;
  const { user } = await session();
  const fattura = await getFattura(params.id, user.id);

  if (!fattura)
    return notFound();

  const indirizziPromise = getIndirizzi({ userId: user.id });

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>
          Modifica Fattura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModificaFattura id={params.id} cassa={user.cassa as UserCassaType} defaultValues={fattura} indirizziPromise={indirizziPromise} />
      </CardContent>
    </Card>
  );
}
