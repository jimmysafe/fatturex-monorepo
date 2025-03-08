import { getAnniContabilita } from "@repo/database/queries/contabilita";

import { parseRequest } from "@/lib/request";
import { json, serverError } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const { user, error } = await parseRequest(request);
    if (error)
      return error();

    const anni = await getAnniContabilita({ userId: user!.id });
    return json(anni);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
