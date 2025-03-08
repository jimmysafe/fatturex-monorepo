import { PaginationParamsSchema } from "@repo/database/pagination/schema";
import { getFatture } from "@repo/database/queries/fatture";
import { FatturaFilterSchema } from "@repo/database/schema";
import { z } from "zod";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

const Schema = z.object({ ...PaginationParamsSchema.shape, ...FatturaFilterSchema.shape });

export async function GET(request: Request) {
  try {
    const { query, user, error } = await parseRequest(request, Schema);
    if (error)
      return error();

    const fatture = await getFatture({ ...query, userId: user!.id });

    return json(fatture);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
