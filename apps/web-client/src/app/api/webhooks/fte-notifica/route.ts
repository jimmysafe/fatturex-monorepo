import type { FteStatoType } from "@repo/database/lib/enums";

import { db } from "@repo/database/client";
import { FteStato } from "@repo/database/lib/enums";
import { and, eq } from "@repo/database/lib/utils";
import { fattura, notaDiCredito } from "@repo/database/schema";
import { Resend } from "resend";

import { env } from "@/env";

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

async function getNotaDiCredito(fteId: string) {
  const nota = await db.query.notaDiCredito.findFirst({
    where: eq(notaDiCredito.fteId, fteId),
  });
  return nota;
}

async function updateNotaDiCredito(fteId: string, stato: FteStatoType, error?: string) {
  await db.update(notaDiCredito).set({
    fteStato: stato,
    fteError: error || null,
  }).where(eq(notaDiCredito.fteId, fteId));
}

export async function POST(request: Request) {
  const body = await request.json() as FteNotificationResponse;

  // eslint-disable-next-line no-console
  console.log("NOTIFICA ->", body.event);
  // !DEBUG NOTIFICA FTE
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Fatturex <no-reply@fatturex.com>",
    to: ["ciaffardini.g@gmail.com"],
    subject: "DEBUG - NOTIFICA FTE",
    html: `<pre>${JSON.stringify(body, null, 2)}</pre>`,
    attachments: [
      { content: JSON.stringify(body, null, 2), filename: "notifica.txt", contentType: "text/plain" },
    ],
  });

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

    const existingNotaDiCredito = await getNotaDiCredito(notification.invoice_uuid);
    const existingFattura = await getFattura(notification.invoice_uuid);

    if (notification.type === "NS") {
      if (existingFattura) {
        if (existingFattura?.fteStato === FteStato.INVIATA)
          return;
        await updateFattura(
          notification.invoice_uuid,
          FteStato.SCARTATA,
          message,
        );
      }

      if (existingNotaDiCredito) {
        if (existingNotaDiCredito?.fteStato === FteStato.INVIATA)
          return;
        await updateNotaDiCredito(notification.invoice_uuid, FteStato.SCARTATA, message);
      }

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
      if (existingFattura) {
        await updateFattura(
          notification.invoice_uuid,
          FteStato.INVIATA,
        );
      }

      if (existingNotaDiCredito) {
        await updateNotaDiCredito(notification.invoice_uuid, FteStato.INVIATA);
      }
    }
  }

  return Response.json({ message: "Ok" }, { status: 200 });
}
