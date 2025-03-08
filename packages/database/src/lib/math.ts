import type { UserCassaType } from "@repo/database/lib/enums";
import type { FatturaArticoloCreateDto, FatturaCreateDto } from "@repo/database/schemas/fattura.schema";

import { UserCassa } from "@repo/database/lib/enums";

export function sommaValoriFattura<T extends Record<string, any>>(fatture: T[], key: keyof T): number {
  const valuesArray = fatture.map(pagamento => pagamento[key]) as number[];
  return valuesArray.reduce((a, b) => {
    return a + b;
  }, 0);
}

export function sommaValori(valori: number[]) {
  return valori.reduce((a, b) => {
    return a + b;
  }, 0);
}

export function sommaArticoli(items: FatturaArticoloCreateDto[]): number {
  return items?.reduce((sum, i) => {
    return sum + i.prezzo * (i.quantita || 1);
  }, 0);
}

export interface FatturaTotali {
  totaleFattura: number;
  parzialeFattura: number;
  contributo: number;
  marcaBollo: number;
  ricavo: number;
  ricavoTassabile: number;
}

export function calcolaTotaliFattura(items: FatturaArticoloCreateDto[], input: FatturaCreateDto, cassa?: UserCassaType) {
  let totaleFattura = 0;
  let parzialeFattura = 0;
  let ricavo = 0;
  let ricavoTassabile = 0;
  let marcaBollo = 0;
  let contributo = 0;

  const sommaPrestazioni = sommaArticoli(items);

  // ENPAP
  if (cassa === UserCassa.ENPAP) {
    // NO addebito CC | NO addebito MB
    if (!input.addebitaContributo && !input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni / 1.02;
      contributo = parzialeFattura * 0.02;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }

    // SI addebito CC | NO addebito MB
    if (input.addebitaContributo && !input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni;
      contributo = parzialeFattura * 0.02;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }

    // NO addebito CC | SI addebito MB
    if (!input.addebitaContributo && input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni / 1.02;
      contributo = parzialeFattura * 0.02;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo + marcaBollo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }

    // SI addebito CC | SI addebito MB
    if (input.addebitaContributo && input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni;
      contributo = parzialeFattura * 0.02;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo + marcaBollo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }
  }

  // GESTIONE SEPARATA
  if (cassa === UserCassa.GESTIONE_SEPARATA) {
    // SI - APPLICA RIVALSA INPS
    if (input.contributo) {
      // NO addebito INPS | NO addebito MB
      if (!input.addebitaContributo && !input.addebitaMarcaDaBollo) {
        parzialeFattura = sommaPrestazioni / 1.04;
        contributo = parzialeFattura * 0.04;
        marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

        ricavoTassabile = parzialeFattura + contributo;

        totaleFattura = ricavoTassabile;
        ricavo = ricavoTassabile;
      }
      // SI addebito INPS | NO addebito MB
      if (input.addebitaContributo && !input.addebitaMarcaDaBollo) {
        parzialeFattura = sommaPrestazioni;
        contributo = parzialeFattura * 0.04;
        marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

        ricavoTassabile = parzialeFattura + contributo;

        totaleFattura = ricavoTassabile;
        ricavo = ricavoTassabile;
      }
      // NO addebito INPS | SI addebito MB
      if (!input.addebitaContributo && input.addebitaMarcaDaBollo) {
        parzialeFattura = sommaPrestazioni / 1.04;
        contributo = parzialeFattura * 0.04;
        marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

        ricavoTassabile = parzialeFattura + contributo + marcaBollo;

        totaleFattura = ricavoTassabile;
        ricavo = ricavoTassabile;
      }

      // SI addebito INPS | SI addebito MB
      if (input.addebitaContributo && input.addebitaMarcaDaBollo) {
        parzialeFattura = sommaPrestazioni;
        contributo = parzialeFattura * 0.04;
        marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

        ricavoTassabile = parzialeFattura + contributo + marcaBollo;

        totaleFattura = ricavoTassabile;
        ricavo = ricavoTassabile;
      }
    }

    // NO - APPLICA RIVALSA INPS
    if (!input.contributo) {
      // NO ADDEBITA MB
      if (!input.addebitaMarcaDaBollo) {
        parzialeFattura = sommaPrestazioni;
        marcaBollo = parzialeFattura >= 77.47 ? 2 : 0;

        ricavoTassabile = parzialeFattura;

        totaleFattura = ricavoTassabile;
        ricavo = ricavoTassabile;
      }
      // SI ADDEBITA MB
      if (input.addebitaMarcaDaBollo) {
        parzialeFattura = sommaPrestazioni;
        marcaBollo = parzialeFattura >= 77.47 ? 2 : 0;

        ricavoTassabile = parzialeFattura + marcaBollo;

        totaleFattura = ricavoTassabile;
        ricavo = ricavoTassabile;
      }
    }
  }

  // ENPAPI o CASSA FORENSE
  if (cassa === UserCassa.ENPAPI || cassa === UserCassa.CASSA_FORENSE) {
    // NO addebito CC | NO addebito MB
    if (!input.addebitaContributo && !input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni / 1.04;
      contributo = parzialeFattura * 0.04;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }

    // SI addebito CC | NO addebito MB
    if (input.addebitaContributo && !input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni;
      contributo = parzialeFattura * 0.04;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }

    // NO addebito CC | SI addebito MB
    if (!input.addebitaContributo && input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni / 1.04;
      contributo = parzialeFattura * 0.04;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo + marcaBollo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }

    // SI addebito CC | SI addebito MB
    if (input.addebitaContributo && input.addebitaMarcaDaBollo) {
      parzialeFattura = sommaPrestazioni;
      contributo = parzialeFattura * 0.04;
      marcaBollo = parzialeFattura + contributo >= 77.47 ? 2 : 0;

      ricavoTassabile = parzialeFattura + contributo + marcaBollo;

      totaleFattura = ricavoTassabile;
      ricavo = ricavoTassabile;
    }
  }

  return {
    ricavo,
    ricavoTassabile,
    totaleFattura,
    parzialeFattura,
    contributo,
    marcaBollo,
  };
}
