import type { FteStatoType } from "@repo/database/lib/enums";

import { db } from "@repo/database/client";
import { FteStato } from "@repo/database/lib/enums";
import { and, eq } from "@repo/database/lib/utils";
import { fattura } from "@repo/database/schema";
import { Resend } from "resend";

import { env } from "@/env";

async function updateFattura(fteId: string, stato: FteStatoType, error?: string) {
  await db.update(fattura).set({
    fteStato: stato,
    fteError: error || null,
  }).where(
    and(eq(fattura.fteId, fteId)),
  );
}

export async function POST(request: Request) {
  const resend = new Resend(env.RESEND_API_KEY);

  const body = await request.json();

  // eslint-disable-next-line no-console
  console.log("NOTIFICA ->", body.event);

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

      const { error } = await resend.emails.send({
        from: "Fatturex <info@basilico.studio>",
        to: "ciaffardini.g@gmail.com",
        subject: `Notifica di scarto`,
        text: `La fattura è stata scartata. \n\n ${JSON.stringify(body, null, 2)} `,
      });

      if (error) {
        console.error("Errore nell'invio della mail", error);
      }
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
