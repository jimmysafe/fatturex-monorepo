"use server";
import { db } from "@repo/database/client";
import { FatturaStato, FteStato } from "@repo/database/lib/enums";
import { and, eq, withinYear } from "@repo/database/lib/utils";
import {
  subscription as _subscription,
  CreateFatturaArticoloSchema,
  CreateFatturaSchema,
  fattura,
  fatturaArticolo,
  FattureExportSchema,
  partitaIva,
  template,
  templateArticolo,
  UpdateFatturaSchema,
} from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import JSZip from "jszip";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ZSAError } from "zsa";

import { generatePdf } from "@/pdf/generate";

import { ricalcoloFattura } from "../casse/ricalcolo";
import { authProcedure } from "../procedures/authenticated";
import { fatturaLimitProcedure } from "../procedures/fattura-limit-procedure";

export const createFattura = fatturaLimitProcedure
  .createServerAction()
  .input(CreateFatturaSchema
    .extend({
      saveAsTemplate: z.boolean().default(false),
      templateName: z.string().optional(),
    }))
  .handler(async ({ input, ctx: { user, subscription } }) => {
    const { articoli, saveAsTemplate, templateName, ...payload } = input;

    const year = payload.dataEmissione.getFullYear();

    const numeroFatturaDuplicato = await db.query.fattura.findFirst({
      where:
                and(
                  eq(fattura.numeroProgressivo, payload.numeroProgressivo),
                  withinYear(fattura.dataEmissione, year),
                  eq(fattura.userId, user.id),
                ),
    });

    if (numeroFatturaDuplicato)
      throw new ZSAError("CONFLICT", `Numero progressivo ${payload.numeroProgressivo} é giá presente per l'anno ${year}`);

    const insertResponse = await db.transaction(async (tx) => {
      if (saveAsTemplate && templateName) {
        const [insertedTemplate] = await db.insert(template).values({ name: templateName, userId: user.id }).returning();

        if (articoli.length > 0 && insertedTemplate) {
          await db.insert(templateArticolo).values(articoli.map(a => ({ ...a, templateId: insertedTemplate.id })));
        }
      }

      const [inserted] = await tx.insert(fattura).values({ ...payload, userId: user.id }).returning();

      if (!inserted?.id)
        return null;

      const [nuoviArticoli] = await Promise.all(
        articoli.map(articolo =>
          tx.insert(fatturaArticolo)
            .values({ ...articolo, fatturaId: inserted.id })
            .returning(),
        ),
      );

      await tx.update(_subscription).set({ invoicesCount: (subscription?.invoicesCount || 0) + 1 }).where(eq(_subscription.userId, user.id));

      return { ...inserted, articoli: nuoviArticoli || [] };
    });

    if (!insertResponse?.id)
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Errore durante la creazione della fattura");

    const f = insertResponse.stato === FatturaStato.SALDATA
      ? await ricalcoloFattura(insertResponse, year)
      : insertResponse;

    revalidatePath(`/`, "layout");

    redirect(`/${f.dataEmissione.getFullYear()}/fatture/${f.id}?success=1`);
  });

export const cambiaStatoFattura = authProcedure
  .createServerAction()
  .input(
    z.object({ id: z.string().uuid().min(1), dataSaldo: z.coerce.date().optional(), stato: z.nativeEnum(FatturaStato) }),
  )
  .handler(async ({ input: { id, dataSaldo, stato }, ctx: { user } }) => {
    if (stato === FatturaStato.SALDATA && !dataSaldo) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Data saldo obbligatoria.");
    }
    try {
      const f = await db.query.fattura.findFirst({
        with: {
          articoli: true,
          indirizzo: true,
          cliente: true,
          user: true,
        },
        where: and(eq(fattura.id, id), eq(fattura.userId, user.id)),
      });
      if (!f)
        throw new ZSAError("NOT_FOUND", "Fattura non trovata");

      await db.update(fattura)
        .set({ stato, dataSaldo: dataSaldo || null })
        .where(eq(fattura.id, f.id))
        .returning();

      const year = dataSaldo ? dataSaldo.getFullYear() : f.dataEmissione.getFullYear();

      const newFattura = await ricalcoloFattura(f, year);

      revalidatePath(`/[anno]/fatture/${id}`, "page");
      return newFattura;
    }
    catch (err) {
      console.error(err);
    }
  });

export const updateFattura = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...UpdateFatturaSchema.shape }))
  .handler(async ({ input: { id, ...updates }, ctx: { user } }) => {
    if (Object.keys(updates).length === 0) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Nessun campo da aggiornare");
    }

    const f = await db.query.fattura.findFirst({ columns: { fteStato: true }, where: and(eq(fattura.id, id), eq(fattura.userId, user.id)) });
    if (!f)
      throw new ZSAError("NOT_FOUND", "Fattura non trovata");

    if (f.fteStato !== FteStato.NON_INVIATA)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Non puoi modificare una fattura già inviata");

    const data = await db.transaction(async (tx) => {
      const [updatedFattura] = await db.update(fattura)
        .set({ ...updates, userId: user.id })
        .where(and(eq(fattura.id, id), eq(fattura.userId, user.id)))
        .returning();

      if (!updatedFattura)
        throw new ZSAError("NOT_FOUND", "Fattura non trovata");

      const existingArticles = await db.query.fatturaArticolo.findMany({ columns: { id: true }, where: eq(fatturaArticolo.fatturaId, id) });
      const articlesIds = existingArticles.map(a => a.id);

      const bodyArticles = updates.articoli || [];
      const bodyArticlesIds = bodyArticles.map(a => a.id).filter(Boolean) as string[];

      const articlesToDelete = articlesIds.filter(id => !bodyArticlesIds.includes(id));
      const articlesToUpdate = bodyArticlesIds.filter(id => articlesIds.includes(id));
      const articlesToInsert = bodyArticles.filter(a => a.id && !articlesToUpdate.includes(a.id));

      const [_, updated, inserted] = await Promise.all([
        ...articlesToDelete.map(async (id) => {
          return tx.delete(fatturaArticolo).where(eq(fatturaArticolo.id, id)).returning();
        }),
        ...articlesToUpdate.map(async (id) => {
          const body = bodyArticles.find(a => a.id === id);
          if (!body)
            return;
          return tx.update(fatturaArticolo).set(body).where(eq(fatturaArticolo.id, id)).returning();
        }),
        ...articlesToInsert.map(async (a) => {
          const { success, data } = CreateFatturaArticoloSchema.safeParse(a);
          if (!success)
            return;
          return tx.insert(fatturaArticolo).values({ ...data, fatturaId: id }).returning();
        }),
      ]);

      return { ...updatedFattura, articoli: [...(inserted || []), ...(updated || [])] };
    });

    const year = data.dataEmissione.getFullYear();

    await ricalcoloFattura(data, year);

    redirect(`/${data.dataEmissione.getFullYear()}/fatture/${data.id}`);
  });

export const deleteFattura = authProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const f = await db.query.fattura.findFirst({ with: { articoli: true }, where: and(eq(fattura.id, id), eq(fattura.userId, user.id)) });
    if (!f)
      throw new ZSAError("NOT_FOUND", "Fattura non trovata");

    if (f.fteStato !== FteStato.NON_INVIATA)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Non puoi eliminare una fattura già inviata");

    const record = await db.transaction(async (tx) => {
      const subscription = await tx.query.subscription.findFirst({
        columns: {
          id: true,
          invoicesCount: true,
          invoicesLimit: true,
        },
        where: eq(_subscription.userId, user.id),
      });

      if (!subscription)
        throw new ZSAError("NOT_FOUND", "Abbonamento non trovato");

      await tx.update(_subscription).set({ invoicesCount: subscription.invoicesCount - 1 }).where(eq(_subscription.userId, user.id));

      const [record] = await tx.delete(fattura)
        .where(and(eq(fattura.id, id), eq(fattura.userId, user.id)))
        .returning();

      return record;
    });

    if (!record)
      throw new ZSAError("NOT_FOUND", "Fattura non trovata");

    const year = f.dataEmissione.getFullYear();
    await ricalcoloFattura(f, year);

    return record;
  });

export const exportFatture = authProcedure
  .createServerAction()
  .input(FattureExportSchema)
  .handler(async ({ input: { anno, stato }, ctx: { user } }) => {
    const zip = new JSZip();

    const piva = await db.query.partitaIva.findFirst({
      where: eq(partitaIva.userId, user.id),
    });
    if (!piva)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata");

    const fatture = await db.query.fattura.findMany({
      with: {
        articoli: true,
        cliente: true,
        indirizzo: true,
        user: true,
      },
      where: and(
        (stato === FatturaStato.SALDATA ? withinYear(fattura.dataSaldo, anno) : withinYear(fattura.dataEmissione, anno)),
        eq(fattura.stato, stato),
        eq(fattura.userId, user.id),
      ),
    });

    await Promise.all(
      fatture.map(async (fattura) => {
        const pdfBuffer = await generatePdf(fattura, piva, {
          ...user,
          cassa: user.cassa!,
          nome: user.nome!,
          cognome: user.cognome!,
        });
        zip.file(`${fattura.numeroProgressivo}-${anno}.pdf`, pdfBuffer);
      }),
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    const res = new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="fatture-${anno}.zip"`,
      },
    });

    return res.blob();
  });
