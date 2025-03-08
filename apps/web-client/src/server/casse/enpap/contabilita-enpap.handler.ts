import type { Contabilita, Fattura } from "@repo/database/schema";

import type { HandlerContabilitaProps } from "..";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type ContabilitaEnpap = AtLeast<
  Contabilita,
  | "fatturato"
  | "totaleTasse"
  | "redditoNetto"
  | "daPagare"
  | "contributiVersati"
  | "contributoModulare"
  | "contributoSoggettivo"
  | "contributoIntegrativo"
  | "contributoSoggettivoMinimo"
  | "contributoIntegrativoMinimo"
  | "ril"
  | "accontoIs"
  | "daPagareIs"
  | "residuoIs"
  | "saldoIs"
>;

export class HandlerContabilitaENPAP {
  anniPartitaIva: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  contabilita_anno_corrente: Contabilita;
  tassa_maternita: number;

  constructor(props: HandlerContabilitaProps) {
    this.anniPartitaIva = props.anniPartitaIva;
    this.contabilitaAnnoPrecedente = props.contabilitaAnnoPrecedente;
    this.contabilita_anno_corrente = props.contabilita_anno_corrente;
    this.tassa_maternita = props.tassa_maternita; // 130;
  }

  public contabilita: ContabilitaEnpap = {
    fatturato: 0,
    totaleTasse: 0,
    redditoNetto: 0,
    daPagare: 0,
    contributiVersati: 0,
    contributoSoggettivo: 0,
    contributoIntegrativo: 0,
    contributoSoggettivoMinimo: 0,
    contributoIntegrativoMinimo: 0,
    contributoModulare: 0,
    ril: 0,
    accontoIs: 0,
    daPagareIs: 0,
    residuoIs: 0,
    saldoIs: 0,
  };

  public calcolaPerFattura(fattura: Fattura) {
    this.contabilita = {
      ...this.contabilita,
      fatturato: this.contabilita.fatturato + fattura.ricavoTassabile,
      contributoSoggettivo:
        this.contabilita.contributoSoggettivo + fattura.soggettivo,
      contributoIntegrativo:
        this.contabilita.contributoIntegrativo + fattura.integrativo,
      contributoModulare:
        this.contabilita.contributoModulare + fattura.modulare,
      ril: this.contabilita.ril + fattura.ril,
      saldoIs: this.contabilita.saldoIs + (fattura.saldoIs || 0),
      accontoIs: this.contabilita.accontoIs + (fattura.accontoIs || 0),
      daPagareIs:
        this.contabilita.daPagareIs
        + (this.anniPartitaIva === 1
          ? (fattura.accontoIs || 0) + (fattura.saldoIs || 0)
          : (fattura.daPagareIs || 0)),
      residuoIs: 0,
    };
  }

  public finalize() {
    this.contabilita = {
      ...this.contabilita,
      contributoSoggettivo: this.contributoSoggettivo,
      contributoIntegrativo: this.contributoIntegrativo,
      contributoSoggettivoMinimo: this.contributoSoggettivoMinimo,
      contributoIntegrativoMinimo: this.contributoIntegrativoMinimo,
      daPagare: this.daPagare,
      totaleTasse: this.totaleTasse,
      redditoNetto: this.redditoNetto,
      contributiVersati: this.contributiVersati,
      residuoIs: this.residuoIs,
    };
  }

  private get residuoIs() {
    if (this.anniPartitaIva === 1)
      return 0;
    const condition
      = (this.contabilitaAnnoPrecedente?.accontoIs ?? 0)
        + (this.contabilitaAnnoPrecedente?.residuoIs ?? 0)
        - this.contabilita.accontoIs
        - this.contabilita.saldoIs;

    if (condition <= 0)
      return 0;
    return condition;
  }

  private get contributoSoggettivoMinimo() {
    const ril = this.contabilita.ril;
    const agevolazione = this.contabilita_anno_corrente.agevolazione;

    switch (true) {
      case ril <= 1560:
        return 156;
      case agevolazione:
        return 390;
      case this.anniPartitaIva <= 3 && ril > 1560:
        return 260;
      case this.anniPartitaIva > 3 && ril > 1560:
        return 780;
      default:
        return 156;
    }
  }

  private get contributoIntegrativoMinimo() {
    return 60;
  }

  private get contributoSoggettivo() {
    return this.contabilita.contributoSoggettivo
      <= this.contributoSoggettivoMinimo
      ? this.contributoSoggettivoMinimo
      : this.contabilita.contributoSoggettivo
        + this.contabilita.contributoModulare;
  }

  private get contributoIntegrativo() {
    return this.contabilita.contributoIntegrativo
      <= this.contributoIntegrativoMinimo
      ? this.contributoIntegrativoMinimo
      : this.contabilita.contributoIntegrativo;
  }

  private get daPagare() {
    return (
      this.contributoIntegrativo
      + this.contributoSoggettivo
      + this.tassa_maternita
    );
  }

  private get totaleTasse() {
    return this.daPagare + this.contabilita.daPagareIs;
  }

  private get redditoNetto() {
    const fatturato = this.contabilita.fatturato;

    if (fatturato - this.totaleTasse < 0)
      return 0;
    return fatturato - this.totaleTasse;
  }

  private get contributiVersati() {
    return this.contributoSoggettivo + this.tassa_maternita;
  }
}
