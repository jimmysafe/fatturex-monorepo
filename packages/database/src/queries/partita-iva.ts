import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { getMeta } from "@repo/database/pagination/get-meta";
import { partitaIva, partitaIva as partitaIvaSchema } from "@repo/database/schema";
import { eq } from "drizzle-orm";

export async function getPartitaIva(userId: string) {
  const partitaIva = await db.query.partitaIva.findFirst({ where: eq(partitaIvaSchema.userId, userId) });
  if (!partitaIva)
    return null;
  return partitaIva;
}

export async function getPartitaIvaList(input: z.infer<typeof PaginationParamsSchema>) {
  const { page, per_page, sort } = input;
  const meta = await getMeta(partitaIva, undefined, {
    page,
    per_page,
    sort,
  });

  const data = await db
    .select()
    .from(partitaIva)
    .limit(meta.data.perPage)
    .offset(meta.skip);

  return { data, meta: meta.data };
}
