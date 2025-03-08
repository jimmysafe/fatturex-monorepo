import { PaginationParamsSchema } from "@repo/database/pagination/schema";
import { getIndirizzi } from "@repo/database/queries/indirizzi";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const { query, user, error } = await parseRequest(request, PaginationParamsSchema);
    if (error)
      return error();

    const indirizzi = await getIndirizzi({ ...query, userId: user!.id });

    return json(indirizzi);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
