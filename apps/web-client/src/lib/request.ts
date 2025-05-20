"server-only";
import type { z, ZodObject } from "zod";

import { auth } from "@repo/auth";
import { headers } from "next/headers";

import { badRequest, unauthorized } from "./response";

export async function getJsonBody(request: Request) {
  try {
    return await request.clone().json();
  }
  catch {
    return undefined;
  }
}

export async function parseRequest<S extends ZodObject<any>>(
  request: Request,
  schema?: S,
  options?: { skipAuth: boolean },
): Promise<{
    url: URL;
    query: z.infer<S>;
    body: z.infer<S>;
    user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"] | null;
    error: (() => Response | undefined) | undefined;
  }> {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  let body = await getJsonBody(request);
  let error: (() => Response | undefined) | undefined;
  let user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"] | null = null;

  if (!options?.skipAuth && !error) {
    user = (await auth.api.getSession({
      headers: await headers(),
    }))?.user || null;

    if (!user) {
      error = () => unauthorized();
    }
  }

  // if (user && env.APP_ENV === "production") {
  //   const { success } = await ratelimit.limit(user.id);
  //   if (!success) {
  //     error = () => rateLimited();
  //   }
  // }

  if (schema) {
    const isGet = request.method === "GET";
    const result = schema.safeParse(isGet ? query : body);

    if (!result.success) {
      error = () => badRequest(result.error);
    }
    else if (isGet) {
      query = result.data as z.infer<S>;
    }
    else {
      body = result.data as z.infer<S>;
    }
  }

  return { url, query, body, user, error };
}
