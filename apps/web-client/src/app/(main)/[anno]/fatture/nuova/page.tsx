import type { UserCassaType } from "@repo/database/lib/enums";

import { getFatturaProssimoProgressivo } from "@repo/database/queries/fatture";
import { getIndirizzi } from "@repo/database/queries/indirizzi";
import { Card, CardContent } from "@repo/ui/components/ui/card";

import { NuovaFattura } from "@/components/modules/fatture/nuova-fattura";
import { session } from "@/lib/session";

export default async function NuovaFatturaPage(props: { params: Promise<{ anno: string }>; searchParams: Promise<{ cid?: string }> }) {
  const search = await props.searchParams;
  const params = await props.params;

  const { user } = await session();
  const indirizziPromise = getIndirizzi({ userId: user.id });
  const progressivoPromise = getFatturaProssimoProgressivo({ anno: params.anno, userId: user.id });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-bold">Nuova Fattura</h1>
      <Card>
        <CardContent>
          <NuovaFattura
            clienteId={search.cid}
            cassa={user.cassa as UserCassaType}
            indirizziPromise={indirizziPromise}
            progressivoPromise={progressivoPromise}
          />
        </CardContent>
      </Card>
    </div>
  );
}
