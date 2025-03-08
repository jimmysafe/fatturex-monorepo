import { getCliente } from "@repo/database/queries/clienti";

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

    const cliente = await getCliente(id, user!.id);
    if (!cliente)
      return notFound();

    return json(cliente);
  }
  catch (error) {
    console.error(error);
    return serverError(error);
  }
}
