/* eslint-disable no-case-declarations */
import type { Contabilita, Fattura, User } from "@repo/database/schema";

import { db } from "@repo/database/client";
import { UserCassa } from "@repo/database/lib/enums";
import { eq } from "@repo/database/lib/utils";
import { partitaIva } from "@repo/database/schema";

import { HandlerContabilitaCASSAFORENSE } from "./cassa-forense/contabilita-cassa-forense.handler";
import { HandlerFatturaCASSAFORENSE } from "./cassa-forense/fattura-cassa-forense.handler";
import { HandlerContabilitaENPAP } from "./enpap/contabilita-enpap.handler";
import { HandlerFatturaENPAP } from "./enpap/fattura-enpap.handler";
import { HandlerContabilitaENPAPI } from "./enpapi/contabilita-enpapi.handler";
import { HandlerFatturaENPAPI } from "./enpapi/fattura-enpapi.handler";
import { HandlerContabilitaGS } from "./gestione-separata/contabilita-gs.handler";
import { HandlerFatturaGS } from "./gestione-separata/fattura-gs.handler";

export interface HandlerFatturaProps {
  fattura: Fattura;
  fatturePrecedenti: Partial<Fattura>[];
  anniPartitaIva: number;
  coefficienteRedditivita: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  contabilita_anno_corrente: Contabilita;
}

export interface HandlerContabilitaProps {
  user: User;
  anniPartitaIva: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  contabilita_anno_corrente: Contabilita;
  tassa_maternita: number;
}

export class Handler {
  user: User;
  constructor(private readonly usr: User) {
    this.user = usr;
  }

  public async fattura_handler(props: HandlerFatturaProps): Promise<Partial<Fattura> | null> {
    switch (this.user.cassa) {
      case UserCassa.GESTIONE_SEPARATA:
        return new HandlerFatturaGS(props).process();
      case UserCassa.ENPAP:
        return new HandlerFatturaENPAP(props).process();
      case UserCassa.ENPAPI:
        return new HandlerFatturaENPAPI(props).process();
      case UserCassa.CASSA_FORENSE:
        return new HandlerFatturaCASSAFORENSE(props).process();
      default:
        return null;
    }
  }

  public async contabilita_handler(props: HandlerContabilitaProps) {
    switch (this.user.cassa) {
      case UserCassa.GESTIONE_SEPARATA:
        return new HandlerContabilitaGS(props);
      case UserCassa.ENPAP:
        return new HandlerContabilitaENPAP(props);
      case UserCassa.ENPAPI:
        return new HandlerContabilitaENPAPI(props);
      case UserCassa.CASSA_FORENSE:
        const piva = await db.query.partitaIva.findFirst({ where: eq(partitaIva?.userId, this.user.id) });
        if (!piva || !piva.dataIscrizioneCassa)
          throw new Error("CASSAFORENSE HANDLER: Partita Iva non trovata");
        return new HandlerContabilitaCASSAFORENSE({ ...props, dataIscrizioneCassa: piva.dataIscrizioneCassa });
      default:
        return null;
    }
  }
}
