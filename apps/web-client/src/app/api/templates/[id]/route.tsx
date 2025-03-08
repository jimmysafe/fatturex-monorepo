import { getTemplate } from "@repo/database/queries/templates";

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

    const template = await getTemplate(id, user!.id);
    if (!template)
      return notFound();

    return json(template);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
