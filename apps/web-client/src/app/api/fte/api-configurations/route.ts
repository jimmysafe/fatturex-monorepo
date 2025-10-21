import { getPartitaIva } from "@repo/database/queries/partita-iva";
import { z } from "zod";

import { env } from "@/env";
import { parseRequest } from "@/lib/request";
import { forbidden, json, notFound, serverError, unauthorized } from "@/lib/response";
import { getOpenapiUrl } from "@/server/openapi";

const Schema = z.object({
  fiscal_id: z.string(),
});

export interface FteApiConfigurationResponse {
  data: {
    callback: {
      event: string;
      provider_uuid: string;
      url: string;
    };
    fiscal_id: string;
    id: string;
  }[];
  error: string | null;
  message: string;
  success: boolean;
}

export async function GET(request: Request) {
  try {
    const { query, user, error } = await parseRequest(request, Schema);
    if (error)
      return error();

    if (!user)
      return unauthorized();

    const partitaIva = await getPartitaIva(user.id);
    if (!partitaIva)
      return notFound();

    if (query.fiscal_id !== partitaIva.numero)
      return forbidden();

    const res = await fetch(`${getOpenapiUrl().sdi}/api_configurations?fiscal_id=${query.fiscal_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAPI_API_KEY}`,
        "Accept": "application/json",
      },
    });

    const result = await res.json();

    return json(result);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
