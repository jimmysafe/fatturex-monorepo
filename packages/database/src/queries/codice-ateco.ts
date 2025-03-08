import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { filtered } from "@repo/database/pagination/filtered";
import { getMeta } from "@repo/database/pagination/get-meta";
import { codiceAteco, CodiceAtecoFilterSchema } from "@repo/database/schema";
import { asc } from "drizzle-orm";

type GetCodiciAtecoArgs = z.infer<typeof PaginationParamsSchema> & z.infer<typeof CodiceAtecoFilterSchema>;
export async function getCodiciAteco(input: GetCodiciAtecoArgs) {
  const { page, per_page, sort, ...filterParams } = input;
  const filterSchema = CodiceAtecoFilterSchema;
  const filterWhere: SQL | undefined = filtered(codiceAteco, filterSchema, filterParams, ["codice", "descrizione"]);
  const where: SQL | undefined = filterWhere;

  const meta = await getMeta(codiceAteco, where, {
    page,
    per_page,
    sort,
  });

  const data = await db
    .select()
    .from(codiceAteco)
    .where(where)
    .orderBy(asc(codiceAteco.codice))
    .limit(meta.data.perPage)
    .offset(meta.skip);

  return {
    data,
    meta: meta.data,
  };
}
