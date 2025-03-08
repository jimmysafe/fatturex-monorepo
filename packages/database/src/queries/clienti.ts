import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { YearParamSchema } from "@repo/shared/params-validators";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { withinYear } from "@repo/database/lib/utils";
import { filtered } from "@repo/database/pagination/filtered";
import { getMeta } from "@repo/database/pagination/get-meta";
import { cliente, ClienteFilterSchema, fattura } from "@repo/database/schema";
import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { and, desc, eq, sql } from "drizzle-orm";

type GetClientiArgs = z.infer<typeof PaginationParamsSchema> & z.infer<typeof ClienteFilterSchema>;
export async function getClienti({ userId, ...input }: GetClientiArgs & { userId: string }) {
  const { page, per_page, sort, ...filterParams } = input;
  const filterSchema = ClienteFilterSchema;
  const filterWhere: SQL | undefined = filtered(cliente, filterSchema, filterParams, ["ragioneSociale", "nome"]);
  const where: SQL | undefined = and(filterWhere, eq(cliente.userId, userId));

  const meta = await getMeta(cliente, where, {
    page,
    per_page,
    sort,
  });

  const data = await db
    .select()
    .from(cliente)
    .where(where)
    .orderBy(desc(cliente.createdAt))
    .limit(meta.data.perPage)
    .offset(meta.skip);

  return {
    data: data.map(c => ({ ...c, nominativo: nominativoCliente(c) })),
    meta: meta.data,
  };
}

export async function getCliente(id: string, userId: string) {
  const where = and(eq(cliente.id, id), eq(cliente.userId, userId));
  const data = await db.query.cliente.findFirst({ where });

  if (!data)
    return null;

  return { ...data, nominativo: nominativoCliente(data) };
}

type GetClientiRecentiArgs = z.infer<typeof YearParamSchema> & { userId: string };
export async function getClientiRecenti({ anno, userId }: GetClientiRecentiArgs) {
  const data = await db
    .select({
      id: cliente.id,
      nome: cliente.nome,
      cognome: cliente.cognome,
      ragioneSociale: cliente.ragioneSociale,
      indirizzo: cliente.indirizzo,
      cap: cliente.cap,
      provincia: cliente.provincia,
      comune: cliente.comune,
      ricavo: sql<number>`sum(${fattura.ricavo})`,
    })
    .from(fattura)
    .innerJoin(cliente, eq(fattura.clienteId, cliente.id))
    .where(and(
      withinYear(fattura.dataEmissione, anno),
      eq(fattura.userId, userId),
    ))
    .groupBy(cliente.id)
    .orderBy(desc(sql`sum(${fattura.ricavo})`))
    .limit(5);

  const result = data.map(c => ({ ...c, nominativo: nominativoCliente(c) }));

  return result;
}
