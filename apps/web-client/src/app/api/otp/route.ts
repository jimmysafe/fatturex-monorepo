import { db } from "@repo/database/client";
import { eq } from "@repo/database/lib/utils";
import { verification } from "@repo/database/schema";
import { z } from "zod";

import { env } from "@/env";
import { parseRequest } from "@/lib/request";
import { forbidden, json, notFound } from "@/lib/response";

export async function GET(request: Request) {
  const { user, query, error } = await parseRequest(request, z.object({ email: z.string().email() }), { skipAuth: env.APP_ENV !== "production" });
  if (error)
    return error();

  //  If a user search for another user otp.
  if (user) {
    if (user.email === query.email)
      return forbidden();
  }

  const otp = await db.query.verification.findFirst({
    columns: {
      value: true,
    },
    where: eq(verification.identifier, `sign-in-otp-${query.email}`),
  });

  if (!otp)
    return notFound();
  return json({ otp });
}
