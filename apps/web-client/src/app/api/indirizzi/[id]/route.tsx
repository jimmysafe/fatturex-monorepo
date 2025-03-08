import { getIndirizzo } from "@repo/database/queries/indirizzi";

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

    const indirizzo = await getIndirizzo(id, user!.id);
    if (!indirizzo)
      return notFound();

    return json(indirizzo);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
