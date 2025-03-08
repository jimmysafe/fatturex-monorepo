import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { createServerActionProcedure } from "zsa";

import { env } from "@/env";

import { ratelimit } from "../redis/rate-limiter";

export const authProcedure = createServerActionProcedure()
  .handler(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      throw new Error("User not authenticated");

    if (env.APP_ENV === "production") {
      const { success } = await ratelimit.limit(session.user.id);
      if (!success)
        throw new Error("Rate limit exceeded");
    }

    return session;
  });
