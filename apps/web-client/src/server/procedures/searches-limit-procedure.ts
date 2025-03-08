import { db } from "@repo/database/client";
import { eq } from "@repo/database/lib/utils";
import { subscription as _subscription } from "@repo/database/schema";
import { createServerActionProcedure, ZSAError } from "zsa";

import { authProcedure } from "./authenticated";

export const searchesLimitProcedure = createServerActionProcedure(authProcedure)
  .handler(async ({ ctx: session }) => {
    const subscription = await db.query.subscription.findFirst({
      columns: {
        id: true,
        searchesCount: true,
        searchesLimit: true,
      },
      where: eq(_subscription.userId, session.user.id),
    });

    const returnValue = {
      user: session.user,
      subscription,
    };

    if ((subscription?.searchesCount || 0) >= (subscription?.searchesLimit || 0))
      throw new ZSAError("PAYMENT_REQUIRED", "Effettua upgrade al tuo piano di abbonamento.");

    return returnValue;
  });
