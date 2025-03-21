import type { UserCassaType } from "@repo/database/lib/enums";
import type { Fattura } from "@repo/database/schema";

import { db } from "@repo/database/client";
import { and, eq, withinYear } from "@repo/database/lib/utils";
import { contabilita as contabilitaDb, fattura as fatturaDb, partitaIva as partitaIvaDb, tassaMaternita as tassaMaternitaDb, user as userDb } from "@repo/database/schema";

import { Handler } from "@/server/casse";

export async function ricalcoloCassa({
  userId,
  anno,
  fattureSaldate,
}: {
  userId: string;
  fattureSaldate: Fattura[];
  anno: number;
}) {
  const user = await db.query.user.findFirst({ where: eq(userDb.id, userId) });
  if (!user)
    throw new Error("Utente non trovato");

  const partitaIva = await db.query.partitaIva.findFirst({ where: eq(partitaIvaDb?.userId, user.id) });
  if (!partitaIva)
    throw new Error("Partita IVA non trovata");
  const anniPartitaIva = anno - new Date(partitaIva.dataApertura).getFullYear() + 1;
  const coefficienteRedditivita = partitaIva.coefficienteRedditivita;

  const contabilitaAnnoCorrente = await db.query.contabilita.findFirst({ where: and(eq(contabilitaDb.anno, anno), eq(contabilitaDb.userId, user.id)) });
  if (!contabilitaAnnoCorrente)
    throw new Error("Contabilita anno corrente non trovata");

  const contabilitaAnnoPrecedente = await db.query.contabilita.findFirst({ where: and(eq(contabilitaDb.anno, anno - 1), eq(contabilitaDb.userId, user.id)) });

  const tassa = await db.query.tassaMaternita.findFirst({ columns: { prezzo: true }, where: and(eq(tassaMaternitaDb.anno, anno), eq(tassaMaternitaDb.cassa, user.cassa! as UserCassaType)) });
  const tassa_maternita = tassa?.prezzo || 0;

  const handler = new Handler({ ...user, cassa: user.cassa! });

  const contabilitaHandler = await handler.contabilita_handler({
    user: { ...user, cassa: user.cassa! },
    anniPartitaIva,
    contabilita_anno_corrente: contabilitaAnnoCorrente,
    contabilitaAnnoPrecedente,
    tassa_maternita,
  });

  const fatture_processate: Partial<Fattura>[] = [];

  for await (const fattura of fattureSaldate) {
    const handler = new Handler({ ...user, cassa: user.cassa! });
    const fattura_processata = await handler.fattura_handler({
      fattura,
      fatturePrecedenti: fatture_processate,
      anniPartitaIva,
      coefficienteRedditivita,
      contabilitaAnnoPrecedente,
      contabilita_anno_corrente: contabilitaAnnoCorrente,
    });

    fatture_processate.push(fattura_processata ?? {});
    contabilitaHandler?.calcolaPerFattura(fattura_processata as any);

    await db.transaction(async (tx) => {
      for (const processed of fatture_processate) {
        if (!processed.id)
          continue;
        await tx.update(fatturaDb).set(processed).where(eq(fatturaDb.id, processed.id)).returning();
      }
    });
  }

  contabilitaHandler?.finalize();

  return db.update(contabilitaDb).set(contabilitaHandler?.contabilita || {}).where(eq(contabilitaDb.id, contabilitaAnnoCorrente.id)).returning();
}

export async function ricalcoloFattura(
  fattura: Fattura,
  anno: number,
): Promise<Fattura> {
  const fattureSaldate = await db.query.fattura.findMany({ with: { articoli: true }, where: and(withinYear(fatturaDb.dataSaldo, anno), eq(fatturaDb.userId, fattura.userId)) });

  await ricalcoloCassa({ userId: fattura.userId, anno, fattureSaldate });

  // Notifica Ricalcolo anno successivo se fattura saldata in anno precedente
  if (anno !== new Date().getFullYear()) {
    const contabilitaAnnoSuccessivo = await db.query.contabilita.findFirst({ where: and(eq(contabilitaDb.anno, anno + 1), eq(contabilitaDb.userId, fattura.userId)) });
    if (!contabilitaAnnoSuccessivo)
      throw new Error("Contabilita anno successivo non trovata");
    await db.update(contabilitaDb).set({ daRicalcolare: true }).where(eq(contabilitaDb.id, contabilitaAnnoSuccessivo.id));
  }

  return fattura;
}
