import { db } from "@repo/database/client";
import { notaDiCredito } from "@repo/database/schema";
import { and, eq } from "drizzle-orm";

export async function getFatturaNoteDiCredito(fatturaId: string, userId: string) {
  const data = await db.query.notaDiCredito.findMany({
    where: and(eq(notaDiCredito.fatturaId, fatturaId), eq(notaDiCredito.userId, userId)),
    with: {
      fattura: {
        with: {
          indirizzo: true,
          cliente: true,
          articoli: true,
        },
      },
    },
  });
  return data;
}

export async function getNotaDiCredito(id: string, userId: string) {
  const where = and(eq(notaDiCredito.id, id), eq(notaDiCredito.userId, userId));
  const data = await db.query.notaDiCredito.findFirst({
    with: {
      fattura: {
        with: {
          indirizzo: true,
          cliente: true,
          articoli: true,
        },
      },
    },
    where,
  });

  if (!data)
    return null;
  return data;
}
