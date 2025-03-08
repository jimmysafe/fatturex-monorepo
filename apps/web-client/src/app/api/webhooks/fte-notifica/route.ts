import type { FteStatoType } from "@repo/database/lib/enums";

import { db } from "@repo/database/client";
import { FteStato } from "@repo/database/lib/enums";
import { and, eq } from "@repo/database/lib/utils";
import { fattura } from "@repo/database/schema";

async function updateFattura(fteId: string, stato: FteStatoType, error?: string) {
  await db.update(fattura).set({
    fteStato: stato,
    fteError: error || null,
  }).where(
    and(eq(fattura.fteId, fteId)),
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  // eslint-disable-next-line no-console
  console.log("===================================");
  // eslint-disable-next-line no-console
  console.log("NOTIFICA ->", body.event, body.data.notification?.type, body.data.notification?.invoice_uuid);
  // eslint-disable-next-line no-console
  console.log("===================================");

  if (body.event === "customer-notification") {
    const notification = body.data?.notification;
    if (!notification?.invoice_uuid)
      return Response.json({ message: "Cannot handle this notification" }, { status: 200 });

    if (notification.type === "NS") {
      await updateFattura(
        notification.invoice_uuid,
        FteStato.SCARTATA,
        notification.message?.lista_errori?.Errore?.Descrizione,
      );
    }
    if (notification.type === "RC") {
      await updateFattura(
        notification.invoice_uuid,
        FteStato.INVIATA,
      );
    }
  }

  return Response.json({ message: "Ok" }, { status: 200 });
}
