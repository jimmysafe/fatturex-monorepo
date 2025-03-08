"use server";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import { CreateIndirizzoSchema, indirizzo, UpdateIndirizzoSchema } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { z } from "zod";
import { ZSAError } from "zsa";

import { authProcedure } from "../procedures/authenticated";

export const createIndirizzo = authProcedure
  .createServerAction()
  .input(CreateIndirizzoSchema)
  .handler(async ({ input, ctx: { user } }) => {
    const [inserted] = await db.insert(indirizzo).values({ ...input, userId: user.id }).returning();
    return inserted;
  });

export const updateIndirizzo = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...UpdateIndirizzoSchema.shape }))
  .handler(async ({ input: { id, ...updates }, ctx: { user } }) => {
    if (Object.keys(updates).length === 0) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Nessun campo da aggiornare");
    }

    const [data] = await db.update(indirizzo)
      .set({ ...updates, userId: user.id })
      .where(eq(indirizzo.id, id))
      .returning();

    if (!data)
      throw new ZSAError("NOT_FOUND", "indirizzo non trovato");

    return data;
  });

export const deleteIndirizzo = authProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const [record] = await db.delete(indirizzo)
      .where(and(eq(indirizzo.id, id), eq(indirizzo.userId, user.id)))
      .returning();
    return record;
  });
