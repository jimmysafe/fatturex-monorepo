"use server";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import { CreatePartitaIvaSchema, partitaIva, UpdatePartitaIvaSchema } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { partitaIvaRegex } from "@repo/shared/regex";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ZSAError } from "zsa";

import { authProcedure } from "../procedures/authenticated";

export const checkExistingPartitaIva = authProcedure
  .createServerAction()
  .input(z.object({ numero: z.string().regex(partitaIvaRegex).min(1) }))
  .handler(async ({ input }) => {
    const existing = await db.query.partitaIva.findFirst({
      columns: {
        numero: true,
      },
      where: eq(partitaIva.numero, input.numero),
    });

    if (existing)
      return { exists: true };
    return { exists: false };
  });

export const createPartitaIva = authProcedure
  .createServerAction()
  .input(CreatePartitaIvaSchema)
  .handler(async ({ input, ctx: { user } }) => {
    const [inserted] = await db.insert(partitaIva).values({ ...input, userId: user.id }).returning();
    return inserted;
  });

export const updatePartitaIva = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...UpdatePartitaIvaSchema.shape }))
  .handler(async ({ input: { id, ...updates }, ctx: { user } }) => {
    if (Object.keys(updates).length === 0) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Nessun campo da aggiornare");
    }

    const [data] = await db.update(partitaIva)
      .set({ ...updates, userId: user.id })
      .where(eq(partitaIva.id, id))
      .returning();

    if (!data)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata");

    revalidatePath("/[anno]/fatture/[id]", "page");

    return data;
  });

export const deletePartitaIva = authProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const [record] = await db.delete(partitaIva)
      .where(and(eq(partitaIva.id, id), eq(partitaIva.userId, user.id)))
      .returning();
    return record;
  });
