"use server";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import { getAnniContabilita } from "@repo/database/queries/contabilita";
import { getFattureSaldate } from "@repo/database/queries/fatture";
import { contabilita, CreateContabilitaSchema, UpdateContabilitaSchema } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ZSAError } from "zsa";

import { ricalcoloCassa } from "../casse/ricalcolo";
import { authProcedure } from "../procedures/authenticated";

export const createContabilita = authProcedure
  .createServerAction()
  .input(CreateContabilitaSchema)
  .handler(async ({ input, ctx: { user } }) => {
    const [inserted] = await db.insert(contabilita).values({ ...input, userId: user.id }).returning();
    revalidatePath(`/${inserted.anno}`);
    return inserted;
  });

export const updateContabilita = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...UpdateContabilitaSchema.shape }))
  .handler(async ({ input: { id, ...updates }, ctx: { user } }) => {
    if (Object.keys(updates).length === 0)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Nessun campo da aggiornare");

    const [data] = await db.update(contabilita)
      .set({ ...updates, userId: user.id })
      .where(eq(contabilita.id, id))
      .returning();

    if (!data)
      throw new ZSAError("NOT_FOUND", "Contabilità non trovata");
    return data;
  });

export const deleteContabilita = authProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const [record] = await db.delete(contabilita)
      .where(and(eq(contabilita.id, id), eq(contabilita.userId, user.id)))
      .returning();
    return record;
  });

export const ricalcoloContabilita = authProcedure
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    try {
      const a = await getAnniContabilita({ userId: user.id });
      const anni = a.sort((a, b) => a.anno - b.anno).map(a => a.anno);

      for (const anno of anni) {
        const fattureSaldate = await getFattureSaldate(anno.toString(), user.id);
        await ricalcoloCassa({ anno, userId: user.id, fattureSaldate });
      }
      revalidatePath("/", "layout");
      return { success: true };
    }
    catch (error) {
      console.error(error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Errore durante il ricalcolo delle contabilità");
    }
  });
