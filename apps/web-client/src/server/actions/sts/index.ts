"use server";

import { db } from "@repo/database/client";
import { StsStato, UserCassa } from "@repo/database/lib/enums";
import { and, eq } from "@repo/database/lib/utils";
import { fattura as _fattura, partitaIva as _partitaIva, StsCancellazioneSchema, StsInvioSchema } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { z } from "zod";
import { ZSAError } from "zsa";

import { authProcedure } from "@/server/procedures/authenticated";

import { cancellazione, invio } from "./service";

export const stsInvioFattura = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...StsInvioSchema.shape }))
  .handler(async ({ input: { id, ...body }, ctx: { user } }) => {
    if (user.cassa !== UserCassa.ENPAP)
      throw new ZSAError("FORBIDDEN", "Operazione non consentita");
    const fattura = await db.query.fattura.findFirst({
      with: {
        articoli: true,
        cliente: true,
      },
      where: and(eq(_fattura.id, id), eq(_fattura.userId, user.id)),
    });

    const partitaIva = await db.query.partitaIva.findFirst({
      where: eq(_partitaIva.userId, user.id),
    });

    if (!fattura || !partitaIva)
      throw new ZSAError("NOT_FOUND", "Fattura o partita iva non trovata");

    const res = await invio({ fatturaId: fattura.id, dto: body, userId: user.id });

    if (res.esitoChiamata === "0") {
      await db.update(_fattura).set({
        stsProtocollo: res.protocollo,
        stsStato: StsStato.INVIATA,
      }).where(eq(_fattura.id, fattura.id));

      return { success: true };
    }
    else {
      console.error("ERRORE INVIO STS: ", res.listaMessaggi?.messaggio?.map(m => m.descrizione).join(", "));
    }
  });

export const stsCancellaFattura = authProcedure
  .createServerAction()
  .input(z.object({ ...IdParamSchema.shape, ...StsCancellazioneSchema.shape }))
  .handler(async ({ input: { id, ...body }, ctx: { user } }) => {
    if (user.cassa !== UserCassa.ENPAP)
      throw new ZSAError("FORBIDDEN", "Operazione non consentita");
    const fattura = await db.query.fattura.findFirst({
      with: {
        articoli: true,
        cliente: true,
      },
      where: and(eq(_fattura.id, id), eq(_fattura.userId, user.id)),
    });

    const partitaIva = await db.query.partitaIva.findFirst({
      where: eq(_partitaIva.userId, user.id),
    });

    if (!fattura || !partitaIva)
      throw new ZSAError("NOT_FOUND", "Fattura o partita iva non trovata");

    const res = await cancellazione({ dto: body, fatturaId: fattura.id, userId: user.id });

    await db.update(_fattura).set({
      stsProtocollo: "",
      stsStato: StsStato.CANCELLATA,
    }).where(eq(_fattura.id, fattura.id));

    return { success: true, res };
  });
