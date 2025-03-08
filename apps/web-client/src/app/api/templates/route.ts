import { PaginationParamsSchema } from "@repo/database/pagination/schema";
import { getTemplates } from "@repo/database/queries/templates";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const { query, user, error } = await parseRequest(request, PaginationParamsSchema);
    if (error)
      return error();

    const templates = await getTemplates({ ...query, userId: user!.id });

    return json(templates);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
