import type { Contabilita, Fattura } from "@repo/database/schema";

import { sommaValoriFattura } from "@repo/database/lib/math";

import type { HandlerFatturaProps } from "..";

export class HandlerFatturaGS {
  fattura: Fattura;
  fatturePrecedenti: Partial<Fattura>[];
  anniPartitaIva: number;
  coefficienteRedditivita: number;
  contabilitaAnnoPrecedente?: Contabilita | null;
  constructor(readonly props: HandlerFatturaProps) {
    this.fattura = props.fattura;
    this.fatturePrecedenti = props.fatturePrecedenti;
    this.anniPartitaIva = props.anniPartitaIva;
    this.coefficienteRedditivita = props.coefficienteRedditivita;
    this.contabilitaAnnoPrecedente = props.contabilitaAnnoPrecedente;
  }

  public process(): Partial<Fattura> {
    return {
      id: this.fattura.id,
      ricavo: this.ricavo,
      ricavoTassabile: this.ricavoTassabile,
      ril: this.ril,
      saldoGs: this.saldoGs,
      accontoGs: this.accontoGs,
      totaleGs: this.totaleGs,
      rilIs: this.rilIs,
      saldoIs: this.saldoIs,
      accontoIs: this.accontoIs,
      totaleIs: this.totaleIs,
      daPagareIs: this.daPagareIs,
      totaleTasse: this.totaleTasse,
      netto: this.netto,
      residuoIs: this.residuoIs,
      residuoGs: this.residuoGs,
      daPagareGs: this.daPagareGs,
    };
  }

  private get ricavo() {
    return this.fattura.ricavo;
  }

  private get ricavoTassabile() {
    return this.fattura.ricavoTassabile;
  }

  private get ril() {
    return this.coefficienteRedditivita * this.ricavoTassabile;
  }

  private get saldoGs() {
    return (26.23 / 100) * this.ril;
  }

  private get accontoGs() {
    return (80 / 100) * this.saldoGs;
  }

  private get totaleGs() {
    return this.saldoGs + this.accontoGs;
  }

  private get daPagareGs() {
    if (this.anniPartitaIva > 1) {
      if (this.fatturePrecedenti.length === 0) {
        // First Payment
        const condition
          = this.totaleGs
            - (this.contabilitaAnnoPrecedente?.residuo ?? 0)
            - (this.contabilitaAnnoPrecedente?.acconto ?? 0);
        if (condition <= 0)
          return 0;
        return condition;
      }
      else {
        const totaleGsPrecedenti
          = sommaValoriFattura(this.fatturePrecedenti, "totaleGs")
            + this.totaleGs;
        const totaledaPagareGsPrecedenti = sommaValoriFattura(
          this.fatturePrecedenti,
          "daPagareGs",
        );

        const condition
          = totaleGsPrecedenti
            - (this.contabilitaAnnoPrecedente?.residuo ?? 0)
            - (this.contabilitaAnnoPrecedente?.acconto ?? 0)
            - totaledaPagareGsPrecedenti;

        if (condition <= 0)
          return 0;
        return condition;
      }
    }

    return this.totaleGs;
  }

  private get rilIs() {
    if (this.anniPartitaIva > 1) {
      if (this.fatturePrecedenti.length === 0) {
        // First Payment
        const condition
          = this.ril - (this.contabilitaAnnoPrecedente?.contributiVersati ?? 0);
        if (condition <= 0)
          return 0;
        return condition;
      }
      else {
        const totaleRilPrecedenti
          = sommaValoriFattura(this.fatturePrecedenti, "ril") + this.ril;
        const totalerilIsPrecedenti = sommaValoriFattura(
          this.fatturePrecedenti,
          "rilIs",
        );

        const condition
          = totaleRilPrecedenti
            - (this.contabilitaAnnoPrecedente?.contributiVersati ?? 0)
            - totalerilIsPrecedenti;

        if (condition <= 0)
          return 0;
        return condition;
      }
    }

    return this.ril;
  }

  private get saldoIs() {
    if (this.anniPartitaIva < 6)
      return (5 / 100) * this.rilIs;
    return (15 / 100) * this.rilIs;
  }

  private get accontoIs() {
    return this.saldoIs;
  }

  private get totaleIs() {
    return this.saldoIs + this.accontoIs;
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
        const totaleIsPrecedenti
          = sommaValoriFattura(this.fatturePrecedenti, "totaleIs")
            + this.totaleIs;
        const totaledaPagareIsPrecedenti = sommaValoriFattura(
          this.fatturePrecedenti,
          "daPagareIs",
        );

        const condition
          = totaleIsPrecedenti
            - (this.contabilitaAnnoPrecedente?.accontoIs ?? 0)
            - (this.contabilitaAnnoPrecedente?.residuoIs ?? 0)
            - totaledaPagareIsPrecedenti;

        if (condition <= 0)
          return 0;
        return condition;
      }
    }

    return this.totaleIs;
  }

  private get totaleTasse() {
    return this.daPagareGs + this.daPagareIs;
  }

  private get netto() {
    const condition = this.ricavoTassabile - this.totaleTasse;
    if (condition <= 0)
      return 0;
    return condition;
  }

  private get residuoIs() {
    const totaleIsPrecedenti
      = sommaValoriFattura(this.fatturePrecedenti, "totaleIs") + this.totaleIs;

    const accontoResiduoAnnoPrecedente
      = (this.contabilitaAnnoPrecedente?.accontoIs ?? 0)
        + (this.contabilitaAnnoPrecedente?.residuoIs ?? 0);

    const condition = accontoResiduoAnnoPrecedente - totaleIsPrecedenti;

    if (condition <= 0)
      return 0;
    return condition;
  }

  private get residuoGs() {
    const totaleGsPrecedenti
      = sommaValoriFattura(this.fatturePrecedenti, "totaleGs") + this.totaleGs;

    const accontoResiduoAnnoPrecedente
      = (this.contabilitaAnnoPrecedente?.acconto ?? 0)
        + (this.contabilitaAnnoPrecedente?.residuo ?? 0);

    // (820.12 + 100) - 3.682692 // 769-31
    const condition = accontoResiduoAnnoPrecedente - totaleGsPrecedenti;
    if (condition <= 0)
      return 0;
    return condition;
  }
}
