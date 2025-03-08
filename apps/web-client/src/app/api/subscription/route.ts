import { getUserSubscription } from "@repo/database/queries/subscription";

import { parseRequest } from "@/lib/request";
import { json, notFound, serverError } from "@/lib/response";

export async function GET(request: Request) {
  try {
    const { user, error } = await parseRequest(request);
    if (error)
      return error();

    const subscription = await getUserSubscription(user!.id);
    if (!subscription)
      return notFound();

    return json(subscription);
  }
  catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
