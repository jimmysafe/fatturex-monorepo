import { PaginationParamsSchema } from "@repo/database/pagination/schema";
import { getFattureCliente } from "@repo/database/queries/fatture";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { query, error, user } = await parseRequest(request, PaginationParamsSchema);
    if (error)
      return error();

    const fatture = await getFattureCliente({ ...query, id, userId: user!.id });

    return json(fatture);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
