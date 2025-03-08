import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { IdParamSchema } from "@repo/shared/params-validators";
import type { SQL } from "drizzle-orm";

import { db } from "@repo/database/client";
import { FatturaStato } from "@repo/database/lib/enums";
import { withinYear } from "@repo/database/lib/utils";
import { filtered } from "@repo/database/pagination/filtered";
import { getMeta } from "@repo/database/pagination/get-meta";
import { fattura, fatturaArticolo, FatturaFilterSchema } from "@repo/database/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

type GetFattureArgs = z.infer<typeof PaginationParamsSchema> & z.infer<typeof FatturaFilterSchema>;
export async function getFatture({ userId, ...input }: GetFattureArgs & { userId: string }) {
  const { page, per_page, sort, ...filterParams } = input;
  const filterSchema = FatturaFilterSchema;

  const { annoEmissione, annoSaldo, stato, ...restFilterParams } = filterParams;

  let where: SQL | undefined = and(filtered(fattura, filterSchema, restFilterParams), eq(fattura.userId, userId));

  if (annoEmissione) {
    where = and(where, withinYear(fattura.dataEmissione, annoEmissione));
  }

  if (annoSaldo) {
    where = and(where, withinYear(fattura.dataSaldo, annoSaldo));
  }

  if (stato) {
    where = and(where, eq(fattura.stato, stato));
  }

  const meta = await getMeta(fattura, where, {
    page,
    per_page,
    sort,
  });

  const data = await db.query.fattura.findMany({
    with: {
      articoli: true,
      cliente: true,
      indirizzo: true,
    },
    limit: meta.data.perPage,
    offset: meta.skip,
    where: and(where, eq(fattura.userId, userId)),
    orderBy: desc(fattura.numeroProgressivo),
  });

  return { data, meta: meta.data };
}

export async function getFattura(id: string, userId: string) {
  const where = and(eq(fattura.id, id), eq(fattura.userId, userId));
  const data = await db.query.fattura.findFirst({
    with: {
      articoli: true,
      indirizzo: true,
      cliente: true,
      user: true,
    },
    where,
  });

  if (!data)
    return null;
  return data;
}

type GetFattureClienteArgs = z.infer<typeof PaginationParamsSchema> & z.infer<typeof IdParamSchema> & { userId: string };
export async function getFattureCliente({ userId, ...input }: GetFattureClienteArgs) {
  const { page, per_page, sort, id } = input;

  const whereFilters: SQL | undefined = and(filtered(fattura, z.any()), eq(fattura.userId, userId));

  const meta = await getMeta(fattura, whereFilters, {
    page,
    per_page,
    sort,
  });

  const where = and(whereFilters, eq(fattura.userId, userId), eq(fattura.clienteId, id));

  const data = await db.query.fattura.findMany({
    where,
    limit: meta.data.perPage,
    offset: meta.skip,
    orderBy: desc(fattura.numeroProgressivo),
    with: {
      cliente: true,
    },
  });

  return { data, meta: meta.data };
}

export async function getFatturaProssimoProgressivo({ anno, userId }: { anno: string; userId: string }) {
  const data = await db.query.fattura.findFirst({
    columns: {
      numeroProgressivo: true,
    },
    orderBy: [desc(fattura.numeroProgressivo)],
    where: and(withinYear(fattura.dataEmissione, anno), eq(fattura.userId, userId)),
  });

  return data ? { numeroProgressivo: data.numeroProgressivo + 1 } : { numeroProgressivo: 1 };
}

export async function getFatturaArticoli(fatturaId: string, userId: string) {
  const where = and(eq(fattura.id, fatturaId), eq(fattura.userId, userId));
  const _fattura = await db.query.fattura.findFirst({ where });

  if (!_fattura)
    return null;

  const data = await db
    .select()
    .from(fatturaArticolo)
    .where(eq(fatturaArticolo.fatturaId, fatturaId));

  return data;
}

export async function getFattureSaldate(anno: string, userId: string) {
  const data = await db.query
    .fattura
    .findMany({
      where: and(
        withinYear(fattura.dataSaldo, anno),
        eq(fattura.userId, userId),
        eq(fattura.stato, FatturaStato.SALDATA),
      ),
      orderBy: asc(fattura.numeroProgressivo),
      with: {
        articoli: true,
      },
    });

  return data;
}
