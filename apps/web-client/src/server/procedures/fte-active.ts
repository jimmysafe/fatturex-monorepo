import { db } from "@repo/database/client";
import { eq } from "@repo/database/lib/utils";
import { subscription as _subscription } from "@repo/database/schema";
import { createServerActionProcedure, ZSAError } from "zsa";

import { authProcedure } from "./authenticated";

export const fteActiveProcedure = createServerActionProcedure(authProcedure)
  .handler(async ({ ctx: session }) => {
    const subscription = await db.query.subscription.findFirst({
      columns: {
        fteEnabled: true,
      },
      where: eq(_subscription.userId, session.user.id),
    });

    if (!subscription?.fteEnabled)
      throw new ZSAError("PAYMENT_REQUIRED", "Devi attivare il servizio Fattura Elettronica per inviare la fattura.");
    return session;
  });
