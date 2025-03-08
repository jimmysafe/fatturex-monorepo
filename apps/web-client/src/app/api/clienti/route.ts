import { PaginationParamsSchema } from "@repo/database/pagination/schema";
import { getClienti } from "@repo/database/queries/clienti";
import { ClienteFilterSchema } from "@repo/database/schema";
import { z } from "zod";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

const Schema = z.object({ ...PaginationParamsSchema.shape, ...ClienteFilterSchema.shape });

export async function GET(request: Request) {
  try {
    const { query, user, error } = await parseRequest(request, Schema);
    if (error)
      return error();

    const clienti = await getClienti({ ...query, userId: user!.id });

    return json(clienti);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
