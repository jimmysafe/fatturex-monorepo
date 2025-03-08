import { getFattura } from "@repo/database/queries/fatture";

import { parseRequest } from "@/lib/request";
import { json, notFound, serverError } from "@/lib/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { user, error } = await parseRequest(request);
    if (error)
      return error();

    const fattura = await getFattura(id, user!.id);
    if (!fattura)
      return notFound();

    return json(fattura);
  }
  catch (error) {
    console.error(error);
    return serverError(error);
  }
}
