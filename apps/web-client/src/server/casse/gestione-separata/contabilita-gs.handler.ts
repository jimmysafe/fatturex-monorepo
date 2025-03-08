import type { Contabilita, Fattura } from "@repo/database/schema";

import { sommaValori } from "@repo/database/lib/math";

import type { HandlerContabilitaProps } from "..";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type ContabilitaGs = AtLeast<
  Contabilita,
  | "fatturato"
  | "totaleTasse"
  | "redditoNetto"
  | "daPagare"
  | "contributiVersati"
  | "residuo"
  | "acconto"
  | "accontoIs"
  | "daPagareIs"
  | "residuoIs"
  | "saldoIs"
>;

export class HandlerContabilitaGS {
  anniPartitaIva: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  constructor(props: HandlerContabilitaProps) {
    this.anniPartitaIva = props.anniPartitaIva;
    this.contabilitaAnnoPrecedente = props.contabilitaAnnoPrecedente;
  }

  public contabilita: ContabilitaGs = {
    fatturato: 0,
    totaleTasse: 0,
    redditoNetto: 0,
    daPagare: 0,
    contributiVersati: 0,
    residuo: 0,
    acconto: 0,
    accontoIs: 0,
    daPagareIs: 0,
    residuoIs: 0,
    saldoIs: 0,
  };

  public residuoGs: number[] = [];
  public saldoGs: number[] = [];
  public accontoGs: number[] = [];
  public residuoIs: number[] = [];

  public calcolaPerFattura(fattura: Fattura) {
    this.contabilita = {
      ...this.contabilita,
      fatturato: this.contabilita.fatturato + fattura.ricavoTassabile,
      totaleTasse: this.contabilita.totaleTasse + fattura.totaleTasse,
      redditoNetto: this.contabilita.redditoNetto + fattura.netto,
      daPagare: this.contabilita.daPagare + fattura.daPagareGs,
      contributiVersati: this.contabilita.daPagare + fattura.daPagareGs,
      residuo: 0,
      saldoIs: this.contabilita.saldoIs + (fattura.saldoIs || 0),
      accontoIs: this.contabilita.accontoIs + (fattura.accontoIs || 0),
      daPagareIs: this.contabilita.daPagareIs + (fattura.daPagareIs || 0),
      residuoIs: 0,
    };

    this.residuoGs.push(fattura.residuoGs);
    this.residuoIs.push((fattura.residuoIs || 0));
    this.saldoGs.push(fattura.saldoGs);
    this.accontoGs.push(fattura.accontoGs);
  }

  public finalize() {
    const ultimoValoreResiduoGs = this.residuoGs[this.residuoGs.length - 1];
    const residuoGs
      = this.residuoGs.length === 0
        ? (this.contabilitaAnnoPrecedente?.residuo ?? 0)
        + (this.contabilitaAnnoPrecedente?.acconto ?? 0)
        : ultimoValoreResiduoGs;

    const ultimoValoreResiduoIs = this.residuoIs[this.residuoIs.length - 1];
    const residuoIs
      = this.residuoIs.length === 0
        ? (this.contabilitaAnnoPrecedente?.residuoIs ?? 0)
        + (this.contabilitaAnnoPrecedente?.accontoIs ?? 0)
        : ultimoValoreResiduoIs;

    this.contabilita = {
      ...this.contabilita,
      residuo: residuoGs || 0,
      acconto: sommaValori(this.accontoGs),
      saldo: sommaValori(this.accontoGs),
      residuoIs: residuoIs || 0,
    };
  }
}
