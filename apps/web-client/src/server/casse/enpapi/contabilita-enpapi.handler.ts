import type { Contabilita, Fattura } from "@repo/database/schema";

import { EnpapiTipoAgevolazione } from "@repo/database/lib/enums";

import type { HandlerContabilitaProps } from "..";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type ContabilitaEnpapi = AtLeast<
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

export class HandlerContabilitaENPAPI {
  anniPartitaIva: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  contabilita_anno_corrente: Contabilita;
  tassa_maternita: number;
  constructor(props: HandlerContabilitaProps) {
    this.anniPartitaIva = props.anniPartitaIva;
    this.contabilitaAnnoPrecedente = props.contabilitaAnnoPrecedente;
    this.contabilita_anno_corrente = props.contabilita_anno_corrente;
    this.tassa_maternita = props.tassa_maternita;
  }

  public contabilita: ContabilitaEnpapi = {
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
    const richiesta_agevolazione = this.contabilita_anno_corrente.agevolazione;
    const tipo_agevolazione
      = this.contabilita_anno_corrente.enpapiTipoAgevolazione;

    // Non richiesta agevolazione
    if (!richiesta_agevolazione)
      return 1600;

    // 1 - Part time <= 50%
    if (tipo_agevolazione === EnpapiTipoAgevolazione.PART_TIME_50)
      return 800;
    // 2 - Part time > 50% && < 100%
    // 3 - Full time -> 100%
    // CASO 2 o 3? allora contributoSoggettivoMinimo é 0
    return 0;
  }

  private get contributoIntegrativoMinimo() {
    const richiesta_agevolazione = this.contabilita_anno_corrente.agevolazione;
    const tipo_agevolazione
      = this.contabilita_anno_corrente.enpapiTipoAgevolazione;

    // Non richiesta agevolazione
    if (!richiesta_agevolazione)
      return 150;

    // 1 - Part time <= 50%
    if (tipo_agevolazione === EnpapiTipoAgevolazione.PART_TIME_50)
      return 150;
    // 2 - Part time > 50% && < 100%
    // 3 - Full time -> 100%
    // CASO 2 o 3? allora contributoSoggettivoMinimo é 0
    return 0;
  }

  private get daPagare() {
    return (
      this.contributoIntegrativo
      + this.contributoSoggettivo
      + this.__tassa_maternita
    );
  }

  private get __tassa_maternita() {
    return this.contabilita_anno_corrente.enpapiTipoAgevolazione
      === EnpapiTipoAgevolazione.FULL_TIME
      ? 0
      : this.tassa_maternita;
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
    return this.contributoSoggettivo + this.__tassa_maternita;
  }
}
