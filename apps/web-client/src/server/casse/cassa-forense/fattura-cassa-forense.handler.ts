import type { Contabilita, Fattura } from "@repo/database/schema";

import { sommaValoriFattura } from "@repo/database/lib/math";

import type { HandlerFatturaProps } from "..";

export class HandlerFatturaCASSAFORENSE {
  fattura: Fattura;
  fatturePrecedenti: Partial<Fattura>[];
  anniPartitaIva: number;
  coefficienteRedditivita: number;
  contabilita_anno_corrente: Contabilita;
  contabilitaAnnoPrecedente?: Contabilita | null;
  constructor(props: HandlerFatturaProps) {
    this.fattura = props.fattura;
    this.fatturePrecedenti = props.fatturePrecedenti;
    this.anniPartitaIva = props.anniPartitaIva;
    this.coefficienteRedditivita = props.coefficienteRedditivita;
    this.contabilita_anno_corrente = props.contabilita_anno_corrente;
    this.contabilitaAnnoPrecedente = props.contabilitaAnnoPrecedente;
  }

  public process(): Partial<Fattura> {
    return {
      ricavo: this.ricavo,
      ricavoTassabile: this.ricavoTassabile,
      ril: this.ril,
      soggettivo: this.soggettivo,
      modulare: this.modulare,
      integrativo: this.integrativo,
      saldoIs: this.saldoIs,
      accontoIs: this.accontoIs,
      totaleIs: this.totaleIs,
      rilIs: this.rilIs,
      daPagareIs: this.daPagareIs,
      totaleTasse: this.totaleTasse,
    };
  }

  private get daPagareIs() {
    if (this.anniPartitaIva > 1) {
      if (this.fatturePrecedenti.length === 0) {
        // First Payment
        const condition
          = this.totaleIs
            - (this.contabilitaAnnoPrecedente?.accontoIs ?? 0)
            - (this.contabilitaAnnoPrecedente?.residuoIs ?? 0);
        if (condition <= 0)
          return 0;
        return condition;
      }
      else {
        // Second and all other payments
        const totaleIsPrecedenti
          = sommaValoriFattura(this.fatturePrecedenti, "totaleIs")
            + this.totaleIs;
        const daPagareIsPrecedenti = sommaValoriFattura(
          this.fatturePrecedenti,
          "daPagareIs",
        );

        const condition
          = totaleIsPrecedenti
            - (this.contabilitaAnnoPrecedente?.accontoIs ?? 0)
            - (this.contabilitaAnnoPrecedente?.residuoIs ?? 0)
            - daPagareIsPrecedenti;
        if (condition <= 0)
          return 0;
        return condition;
      }
    }
    return this.totaleIs;
  }

  private get ricavo() {
    return this.fattura.ricavo;
  }

  private get ricavoTassabile() {
    return this.fattura.ricavoTassabile;
  }

  private get rilIs() {
    if (this.anniPartitaIva > 1 && this.contabilitaAnnoPrecedente) {
      if (this.fatturePrecedenti.length === 0) {
        // First Payment
        const condition
          = this.ril - (this.contabilitaAnnoPrecedente.contributiVersati ?? 0);
        if (condition <= 0)
          return 0;
        return condition;
      }
      else {
        // Second and all other payments
        const rilIsPrecedenti = sommaValoriFattura(
          this.fatturePrecedenti,
          "rilIs",
        );
        const rilPrecedenti
          = sommaValoriFattura(this.fatturePrecedenti, "ril") + this.ril;

        const condition
          = rilPrecedenti
            - (this.contabilitaAnnoPrecedente.contributiVersati ?? 0)
            - rilIsPrecedenti;

        if (condition <= 0)
          return 0;
        return condition;
      }
    }
    return this.ril;
  }

  private get ril() {
    return this.coefficienteRedditivita * this.ricavoTassabile;
  }

  private get soggettivo() {
    return (15 / 100) * this.ril;
  }

  private get modulare() {
    return (
      (this.contabilita_anno_corrente.percentualeModulare / 100) * this.ril
    );
  }

  private get integrativo() {
    return (4 / 100) * this.ricavoTassabile;
  }

  private get saldoIs() {
    if (this.anniPartitaIva > 5)
      return (15 / 100) * this.rilIs;
    if (this.anniPartitaIva > 1)
      return (5 / 100) * this.rilIs;
    return (5 / 100) * this.ril;
  }

  private get accontoIs() {
    if (this.anniPartitaIva > 5)
      return (15 / 100) * this.rilIs;
    if (this.anniPartitaIva > 1)
      return (5 / 100) * this.rilIs;
    return (5 / 100) * this.ril;
  }

  private get totaleIs() {
    return this.saldoIs + this.accontoIs;
  }

  private get totaleTasse() {
    return this.soggettivo + this.integrativo + this.daPagareIs;
  }
}
