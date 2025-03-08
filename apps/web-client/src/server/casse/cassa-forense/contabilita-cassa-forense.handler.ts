import type { Contabilita, Fattura } from "@repo/database/schema";

import type { HandlerContabilitaProps } from "..";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type ContabilitaCassaForense = AtLeast<
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

export class HandlerContabilitaCASSAFORENSE {
  anni_data_iscrizione_cassa: number;
  user_eta: number;
  anniPartitaIva: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  contabilita_anno_corrente: Contabilita;
  tassa_maternita: number;
  constructor(props: HandlerContabilitaProps & { dataIscrizioneCassa: Date }) {
    this.anni_data_iscrizione_cassa
      = new Date().getFullYear()
        - new Date(props.dataIscrizioneCassa).getFullYear()
        + 1;
    this.user_eta
      = new Date().getFullYear()
        - new Date(props.user.dataDiNascita!).getFullYear();
    this.anniPartitaIva = props.anniPartitaIva;
    this.contabilitaAnnoPrecedente = props.contabilitaAnnoPrecedente;
    this.contabilita_anno_corrente = props.contabilita_anno_corrente;
    this.tassa_maternita = props.tassa_maternita;
  }

  public contabilita: ContabilitaCassaForense = {
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

  private get contributoSoggettivoMinimo() {
    if (this.anni_data_iscrizione_cassa <= 6 && this.user_eta <= 35) {
      if (this.contabilita.ril <= 10300)
        return 796.25;
      return 1592.5;
    }
    else {
      if (this.contabilita.ril <= 10300)
        return 1595;
      return 3185;
    }
  }

  private get contributoIntegrativoMinimo() {
    if (this.user_eta > 35)
      return 770;

    switch (true) {
      case this.anni_data_iscrizione_cassa <= 5:
        return 0;
      case this.anni_data_iscrizione_cassa > 5
        && this.anni_data_iscrizione_cassa <= 9:
        return 385;
      case this.anni_data_iscrizione_cassa > 9:
        return 770;
      default:
        return 770;
    }
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
