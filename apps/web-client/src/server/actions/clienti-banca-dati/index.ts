"use server";

import { z } from "zod";
import { ZSAError } from "zsa";

import { env } from "@/env";
import { searchesLimitProcedure } from "@/server/procedures/searches-limit-procedure";

import type { SearchClienteResponse } from "./types";

import { getOpenapiUrl } from "../../openapi";
import { updateSubscription } from "../subscriptions";

export const searchCliente = searchesLimitProcedure.createServerAction().input(z.object({ search: z.string().min(1) })).handler(async ({ input }) => {
  const { search } = input;
  const searchParams = new URLSearchParams({
    dryRun: "1",
    companyName: search,
  }).toString();

  const url = `${getOpenapiUrl().company}/IT-search?${searchParams}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    console.error("Openapi Req Status:", res.status);
    throw new ZSAError("INTERNAL_SERVER_ERROR", "Impossibile recuperare i dati dal server");
  }
  const data = await res.json();

  if (data.error)
    throw new ZSAError("INTERNAL_SERVER_ERROR", data.message || data.error);

  return data as { data: { id: string }[]; success: boolean; message: string; error: any; count: number };
});

export const getDettagliCliente = searchesLimitProcedure
  .createServerAction()
  .input(z.object({ search: z.string() }))
  .handler(async ({ input, ctx: { subscription } }) => {
    if (!subscription)
      throw new ZSAError("NOT_FOUND", "Abbonamento non trovato");

    const { search } = input;
    const searchParams = new URLSearchParams({
      dataEnrichment: "advanced",
      companyName: search,
      limit: "10",
    }).toString();
    const url = `${getOpenapiUrl().company}/IT-search?${searchParams}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Impossibile recuperare i dati dal server");
    }
    const data = await res.json();

    if (data.error)
      throw new ZSAError("INTERNAL_SERVER_ERROR", data.message || data.error);

    const [_, subscriptionError] = await updateSubscription({ id: subscription.id, searchesCount: subscription.searchesCount + 1 });
    if (subscriptionError)
      throw new ZSAError("INTERNAL_SERVER_ERROR", subscriptionError.message);

    return data as SearchClienteResponse;
  });
