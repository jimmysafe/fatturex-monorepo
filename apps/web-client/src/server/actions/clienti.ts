"use server";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import { cliente, CreateClienteSchema, UpdateClienteSchema } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ZSAError } from "zsa";

import { authProcedure } from "../procedures/authenticated";

export const createCliente = authProcedure
  .createServerAction()
  .input(CreateClienteSchema)
  .handler(async ({ input, ctx: { user } }) => {
    const [inserted] = await db.insert(cliente).values({ ...input, userId: user.id }).returning();
    return inserted;
  });

export const updateCliente = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...UpdateClienteSchema.shape }))
  .handler(async ({ input: { id, ...updates }, ctx: { user } }) => {
    if (Object.keys(updates).length === 0) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Nessun campo da aggiornare");
    }

    const [data] = await db.update(cliente)
      .set({ ...updates, userId: user.id })
      .where(eq(cliente.id, id))
      .returning();

    if (!data)
      throw new ZSAError("NOT_FOUND", "Cliente non trovato");

    revalidatePath("/[anno]/clienti/[id]", "page");
    return data;
  });

export const deleteCliente = authProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const [record] = await db.delete(cliente)
      .where(and(eq(cliente.id, id), eq(cliente.userId, user.id)))
      .returning();
    return record;
  });
