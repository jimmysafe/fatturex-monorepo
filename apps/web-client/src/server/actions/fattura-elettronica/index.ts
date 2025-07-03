"use server";

import { db } from "@repo/database/client";
import { FteStato } from "@repo/database/lib/enums";
import { and, eq } from "@repo/database/lib/utils";
import { fattura, partitaIva } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ZSAError } from "zsa";

import { env } from "@/env";
import { fteActiveProcedure } from "@/server/procedures/fte-active";

import type { FteConfigurationResponseSchema, FteResponseSchema } from "./schema";

import { getOpenapiUrl } from "../../openapi";
import { buildXml } from "./builder";

async function fteSetupCallbackEndpoints(numeroPartitaIva: string) {
  const callbacksEvents = ["supplier-invoice", "customer-invoice", "customer-notification", "legal-storage-missing-vat", "legal-storage-receipt"];
  const res = await fetch(`${getOpenapiUrl().sdi}/api_configurations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
      "Accept": "application/json",
    },
    body: JSON.stringify({
      fiscal_id: numeroPartitaIva,
      callbacks: callbacksEvents.map(event => ({
        event,
        url: `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/fte-notifica`,
        // auth_header: env.OPENAPI_FTE_CALLBACK_AUTH_HEADER
      })),
    }),
  });

  const result = await res.json() as z.infer<typeof FteResponseSchema>;

  return result;
}

export const fteActivate = fteActiveProcedure
  .createServerAction()
  .input(z.object({ acceptedTerms: z.boolean() }))
  .handler(async ({ input: { acceptedTerms }, ctx: { user } }) => {
    if (!acceptedTerms)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Devi accettare i termini e le condizioni per attivare il servizio.");

    const piva = await db.query.partitaIva.findFirst({
      where: eq(partitaIva.userId, user.id),
    });

    if (!piva)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata.");

    const configurationResponse = await fetch(`${getOpenapiUrl().sdi}/business_registry_configurations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        fiscal_id: piva.numero,
        name: piva.numero,
        email: user.email,
        apply_signature: true,
        apply_legal_storage: true,
      }),
    });

    const result = await configurationResponse.json() as z.infer<typeof FteConfigurationResponseSchema>;
    if (result.error)
      throw new ZSAError("UNPROCESSABLE_CONTENT", result.message || "Errore durante la creazione della configurazione.");

    if (!configurationResponse.ok)
      throw new ZSAError("UNPROCESSABLE_CONTENT", result.message || "Errore durante la creazione della configurazione.");

    const setupCallbackEndpointsResult = await fteSetupCallbackEndpoints(piva.numero);
    if (!setupCallbackEndpointsResult?.success)
      throw new ZSAError("UNPROCESSABLE_CONTENT", setupCallbackEndpointsResult?.message || "Errore durante la creazione della configurazione.");

    const [updatedPiva] = await db.update(partitaIva).set({
      fteConfigurationId: result.data?.id,
    }).where(eq(partitaIva.id, piva.id)).returning();

    if (!updatedPiva)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata.");

    return result;
  });

export const fteDeactivate = fteActiveProcedure
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    const piva = await db.query.partitaIva.findFirst({
      where: eq(partitaIva.userId, user.id),
    });

    if (!piva)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata.");

    const configurationResponse = await fetch(`${getOpenapiUrl().sdi}/business_registry_configurations/${piva.numero}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
        "Accept": "application/json",
      },
    });

    const result = await configurationResponse.json() as z.infer<typeof FteConfigurationResponseSchema>;
    if (!result.success)
      throw new ZSAError("UNPROCESSABLE_CONTENT", result.message || "Errore durante la cancellazione della configurazione.");

    if (!configurationResponse.ok)
      throw new ZSAError("UNPROCESSABLE_CONTENT", result.message || "Errore durante la cancellazione della configurazione.");

    const [updatedPiva] = await db.update(partitaIva).set({
      fteConfigurationId: null,
    }).where(eq(partitaIva.id, piva.id)).returning();

    if (!updatedPiva)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata.");

    return result;
  });

export const fteSetupCallbacks = fteActiveProcedure
  .createServerAction()
  .handler(async ({ ctx: { user } }) => {
    const piva = await db.query.partitaIva.findFirst({
      where: eq(partitaIva.userId, user.id),
    });

    if (!piva)
      throw new ZSAError("NOT_FOUND", "Partita Iva non trovata.");

    const setupCallbackEndpointsResult = await fteSetupCallbackEndpoints(piva.numero);
    if (!setupCallbackEndpointsResult?.success)
      throw new ZSAError("UNPROCESSABLE_CONTENT", setupCallbackEndpointsResult?.error || "Errore durante la creazione della configurazione.");

    return setupCallbackEndpointsResult;
  });

export const fteInvioFattura = fteActiveProcedure
  .createServerAction()
  .input(IdParamSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    const piva = await db.query.partitaIva.findFirst({
      where: eq(partitaIva.userId, user.id),
    });
    if (!piva)
      throw new ZSAError("NOT_FOUND", "Partita IVA non trovata.");

    if (!piva?.fteConfigurationId)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Devi attivare il servizio Fattura Elettronica per inviare la fattura.");

    const data = await db.query.fattura.findFirst({
      with: {
        articoli: true,
        cliente: true,
      },
      where: and(eq(fattura.id, id), eq(fattura.userId, user.id)),
    });

    if (!data)
      throw new ZSAError("NOT_FOUND", "Fattura non trovata.");

    const xml = buildXml({
      tipoDocumento: "TD01",
      fattura: data,
      cliente: data.cliente,
      partitaIva: piva,
      nomeUtente: `${user.nome} ${user.cognome}`,
    });

    const res = await fetch(`${getOpenapiUrl().sdi}/invoices_signature_legal_storage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
        "Accept": "application/json",
      },
      body: xml.replace(/\s+/g, " ").trim(),
    });

    const result = await res.json() as z.infer<typeof FteResponseSchema>;

    if (!res.ok || result.error)
      throw new ZSAError("UNPROCESSABLE_CONTENT", result?.message || "Errore durante l'invio della fattura.");

    await db.update(fattura).set({
      fteStato: FteStato.PROCESSING,
      fteId: result.data?.uuid,
      fteError: null,
    }).where(
      and(eq(fattura.id, id), eq(fattura.userId, user.id)),
    );

    revalidatePath(`/[anno]/fatture/${id}`, "page");

    return result;
  });
