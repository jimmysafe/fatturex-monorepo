import { getPartitaIva } from "@repo/database/queries/partita-iva";

import { parseRequest } from "@/lib/request";
import { json, notFound, serverError } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const { user, error } = await parseRequest(request);
    if (error)
      return error();

    const piva = await getPartitaIva(user!.id);
    if (!piva)
      return notFound();

    return json(piva);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
