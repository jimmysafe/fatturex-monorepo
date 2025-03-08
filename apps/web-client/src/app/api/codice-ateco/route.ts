import { PaginationParamsSchema } from "@repo/database/pagination/schema";
import { getCodiciAteco } from "@repo/database/queries/codice-ateco";
import { CodiceAtecoFilterSchema } from "@repo/database/schema";
import { z } from "zod";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

const Schema = z.object({ ...PaginationParamsSchema.shape, ...CodiceAtecoFilterSchema.shape });

export async function GET(request: Request) {
  try {
    const { query, error } = await parseRequest(request, Schema);
    if (error)
      return error();

    const codici = await getCodiciAteco(query);

    return json(codici);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
