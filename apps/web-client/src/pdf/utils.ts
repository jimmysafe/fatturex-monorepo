import type { UserCassaType } from "@repo/database/lib/enums";
import type { Fattura } from "@repo/database/schema";

import { UserCassa } from "@repo/database/lib/enums";

// Fix importo unitarion in base all'addebito del contributo (puramente estetico)
export function getUnitPrice(a: { descrizione: string; prezzo: number; quantita: number }, fattura: Fattura, cassa: UserCassaType) {
  if (!fattura.contributo)
    return a.prezzo;
  switch (cassa) {
    case UserCassa.ENPAP:
      return !fattura.addebitaContributo ? a.prezzo / 1.02 : a.prezzo;
    case UserCassa.GESTIONE_SEPARATA:
      return !fattura.addebitaContributo ? a.prezzo / 1.04 : a.prezzo;
    case UserCassa.ENPAPI:
      return !fattura.addebitaContributo ? a.prezzo / 1.04 : a.prezzo;
    case UserCassa.CASSA_FORENSE:
      return !fattura.addebitaContributo ? a.prezzo / 1.04 : a.prezzo;
    default:
      return a.prezzo;
  }
}

export function getCassaText(cassa: UserCassaType) {
  switch (cassa) {
    case UserCassa.ENPAP:
      return "ENPAP";
    case UserCassa.ENPAPI:
      return "ENPAPI";
    case UserCassa.CASSA_FORENSE:
      return "CASSA FORENSE";
    case UserCassa.GESTIONE_SEPARATA:
      return "INPS";
    default:
      return "Nessuna";
  }
}
