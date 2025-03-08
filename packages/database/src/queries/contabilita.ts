import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { YearParamSchema } from "@repo/shared/params-validators";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { sommaValoriFattura } from "@repo/database/lib/math";
import { withinYear } from "@repo/database/lib/utils";
import { getMeta } from "@repo/database/pagination/get-meta";
import { contabilita, fattura } from "@repo/database/schema";
import { mesi } from "@repo/shared/const";
import { and, desc, eq } from "drizzle-orm";

type GetContabilitaByAnnoArgs = z.infer<typeof YearParamSchema> & { userId: string };
export async function getContabilitaByAnno({ userId, anno }: GetContabilitaByAnnoArgs) {
  const [data] = await db.select()
    .from(contabilita)
    .where(and(eq(contabilita.anno, Number(anno)), eq(contabilita.userId, userId)));

  if (!data)
    return null;
  return data;
}

type GetRicavoAnnualeArgs = z.infer<typeof YearParamSchema> & { userId: string };
export async function getRicavoAnnuale({ anno, userId }: GetRicavoAnnualeArgs) {
  const fattureSaldate = await db.query.fattura.findMany({
    columns: {
      ricavo: true,
      dataSaldo: true,
    },
    where: and(withinYear(fattura.dataSaldo, anno), eq(fattura.userId, userId)),
  });

  const result = mesi.map((mese, index) => {
    const filtered = fattureSaldate.filter(
      f => new Date(f.dataSaldo!).getMonth() === index,
    );
    const ricavo = sommaValoriFattura(filtered, "ricavo");
    return { mese, ricavo };
  });

  return result;
}

type GetContabilitaListArgs = z.infer<typeof PaginationParamsSchema> & { userId: string };
export async function getContabilitaList({ userId, ...input }: GetContabilitaListArgs) {
  const { page, per_page, sort } = input;
  const where: SQL | undefined = eq(contabilita.userId, userId);

  const meta = await getMeta(contabilita, where, {
    page,
    per_page,
    sort,
  });

  const data = await db
    .select()
    .from(contabilita)
    .where(where)
    .orderBy(desc(contabilita.anno))
    .limit(meta.data.perPage)
    .offset(meta.skip);

  return { data, meta: meta.data };
}

export async function getContabilita({ id, userId }: { id: string; userId: string }) {
  const where = and(eq(contabilita.id, id), eq(contabilita.userId, userId));
  const [data] = await db.select().from(contabilita).where(where);
  if (!data)
    return null;
  return data;
}

export async function getAnniContabilita({ userId }: { userId: string }) {
  const data = await db.select({
    anno: contabilita.anno,
  })
    .from(contabilita)
    .where(eq(contabilita.userId, userId));

  return data;
}
