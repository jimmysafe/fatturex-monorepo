"use server";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import {
  CreateTemplateArticoloSchema,
  CreateTemplateSchema,
  template,
  templateArticolo,
  UpdateTemplateSchema,
} from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { z } from "zod";
import { ZSAError } from "zsa";

import { authProcedure } from "../procedures/authenticated";

export const createTemplate = authProcedure
  .createServerAction()
  .input(CreateTemplateSchema)
  .handler(async ({ input, ctx: { user } }) => {
    const { articoli, ...body } = input;
    const [inserted] = await db.insert(template).values({ ...body, userId: user.id }).returning();

    if (articoli.length > 0 && inserted) {
      await db.insert(templateArticolo).values(articoli.map(a => ({ ...a, templateId: inserted.id })));
    }

    return inserted;
  });

export const updateTemplate = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...UpdateTemplateSchema.shape }))
  .handler(async ({ input: { id, ...updates }, ctx: { user } }) => {
    if (Object.keys(updates).length === 0) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Nessun campo da aggiornare");
    }

    const { articoli, ...body } = updates;

    const data = await db.transaction(async (tx) => {
      const [updatedTemplate] = await db.update(template)
        .set({ ...body, userId: user.id })
        .where(and(eq(template.id, id), eq(template.userId, user.id)))
        .returning();

      if (!updatedTemplate)
        throw new ZSAError("NOT_FOUND", "Template non trovato");

      const existingArticles = await db.query.templateArticolo.findMany({ columns: { id: true }, where: eq(templateArticolo.templateId, id) });
      const articlesIds = existingArticles.map(a => a.id);

      const bodyArticles = articoli || [];
      const bodyArticlesIds = bodyArticles.map(a => a.id).filter(Boolean) as string[];

      const articlesToDelete = articlesIds.filter(id => !bodyArticlesIds.includes(id));
      const articlesToUpdate = bodyArticlesIds.filter(id => articlesIds.includes(id));
      const articlesToInsert = bodyArticles.filter(a => a.id && !articlesToUpdate.includes(a.id));

      const [_, updated, inserted] = await Promise.all([
        ...articlesToDelete.map(async (id) => {
          return tx.delete(templateArticolo).where(eq(templateArticolo.id, id)).returning();
        }),
        ...articlesToUpdate.map(async (id) => {
          const body = bodyArticles.find(a => a.id === id);
          if (!body)
            return;
          return tx.update(templateArticolo).set(body).where(eq(templateArticolo.id, id)).returning();
        }),
        ...articlesToInsert.map(async (a) => {
          const { success, data } = CreateTemplateArticoloSchema.safeParse(a);
          if (!success)
            return;
          return tx.insert(templateArticolo).values({ ...data, templateId: id }).returning();
        }),
      ]);

      return { ...updatedTemplate, articoli: [...(inserted || []), ...(updated || [])] };
    });

    return data;
  });

export const deleteTemplate = authProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const [record] = await db.delete(template)
      .where(and(eq(template.id, id), eq(template.userId, user.id)))
      .returning();
    return record;
  });
