"use server";
import { auth } from "@repo/auth";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import { fattura } from "@repo/database/schema";
import NuovaFatturaEmail from "@repo/ui/components/email/nuova-fattura";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { createServerAction, ZSAError } from "zsa";

import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export const sendFatturaEmail = createServerAction()
  .input(z.object({
    subject: z.string().min(1),
    to: z.string().email(),
    message: z.string().min(1),
    fatturaId: z.string().uuid(),
    fatturaBase64: z.string().min(1),
  }))
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;

    if (!user)
      throw new ZSAError("FORBIDDEN", "Non autenticato");

    const f = await db.query.fattura.findFirst({
      with: {
        articoli: true,
        indirizzo: true,
        cliente: true,
      },
      where: and(eq(fattura.id, input.fatturaId), eq(fattura.userId, user.id)),
    });

    if (!f)
      throw new ZSAError("NOT_FOUND", "Fattura non trovata");

    const { data, error } = await resend.emails.send({
      from: "Fatturex <no-reply@fatturex.com>",
      to: [input.to],
      cc: [user.email],
      subject: `Fatturex - ${input.subject}`,
      react: NuovaFatturaEmail({ message: input.message, nomeUtente: `${user.nome} ${user.cognome}` }),
      attachments: [
        {
          content: input.fatturaBase64,
          filename: `FATTURA-${f.numeroProgressivo}-${new Date(f.dataEmissione).getFullYear()}.pdf`,
        },
      ],
    });

    if (error) {
      console.error(error);
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore nell'invio della mail");
    }

    await db.update(fattura).set({ dataInvioEmail: new Date() });

    revalidatePath("/[anno]/fatture/[id]", "page");

    return data;
  });
