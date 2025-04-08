import type { FteStatoType } from "@repo/database/lib/enums";

import { db } from "@repo/database/client";
import { FteStato } from "@repo/database/lib/enums";
import { and, eq } from "@repo/database/lib/utils";
import { fattura } from "@repo/database/schema";

import type { FteNotificationResponse } from "./types";

async function updateFattura(fteId: string, stato: FteStatoType, error?: string) {
  await db.update(fattura).set({
    fteStato: stato,
    fteError: error || null,
  }).where(
    and(eq(fattura.fteId, fteId)),
  );
}

async function getFattura(fteId: string) {
  const f = await db.query.fattura.findFirst({
    where: eq(fattura.fteId, fteId),
  });
  return f;
}

export async function POST(request: Request) {
  const body = await request.json() as FteNotificationResponse;

  // eslint-disable-next-line no-console
  console.log("NOTIFICA ->", body.event);

  if (body.event === "customer-notification") {
    const notification = body.data?.notification;
    if (!notification?.invoice_uuid)
      return Response.json({ message: "Cannot handle this notification" }, { status: 200 });

    const errori = notification.message?.lista_errori?.Errore;
    const message = !errori
      ? "Errore nell'invio della fattura elettronica."
      : Array.isArray(errori)
        ? errori.map(e => (e.Suggerimento ?? e.Descrizione)).join("|")
        : errori.Suggerimento ?? errori.Descrizione;

    if (notification.type === "NS") {
      const existingFattura = await getFattura(notification.invoice_uuid);
      if (existingFattura?.fteStato === FteStato.INVIATA)
        return;

      await updateFattura(
        notification.invoice_uuid,
        FteStato.SCARTATA,
        message,
      );

      //  TODO: SEND SCARTO EMAIL
      // const resend = new Resend(env.RESEND_API_KEY);
      // const { error } = await resend.emails.send({
      //   from: "Fatturex <no-reply@fatturex.com>",
      //   to: "ciaffardini.g@gmail.com",
      //   subject: `Notifica di scarto`,
      //   text: `La fattura è stata scartata. \n\n ${JSON.stringify(body, null, 2)} `,
      // });

      // if (error) {
      //   console.error("Errore nell'invio della mail", error);
      // }
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
