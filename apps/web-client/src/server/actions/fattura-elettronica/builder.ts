import type { Cliente, Fattura, PartitaIva } from "@repo/database/schema";

import { FatturaMetodoPagamento } from "@repo/database/lib/enums";
import { format } from "date-fns";
import randomstring from "randomstring";
import convert from "xml-js";

import type { DatiAnagrafici, DettaglioPagamento, FatturaElettronica, TipoDocumento } from "./types";

interface BaseParams {
  fattura: Fattura;
  cliente: Cliente;
  partitaIva: PartitaIva;
  tipoDocumento: TipoDocumento;
  nomeUtente: string;
};

function fileEncode(data: FatturaElettronica): string {
  const preset = {
    "p:FatturaElettronica": {
      _attributes: {
        "xmlns:p":
            "http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2",
        "xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "versione": "FPR12",
      },
      FatturaElettronicaHeader: data.FatturaElettronicaHeader,
      FatturaElettronicaBody: data.FatturaElettronicaBody,
    },
  };

  const xml = convert.js2xml(preset, { compact: true });
  const converted = `<?xml version="1.0" encoding="UTF-8"?>${xml}`;
  return converted.replace(/\s+/g, " ").trim();
}

function formatData({
  fattura,
  cliente,
  partitaIva,
  nomeUtente,
  tipoDocumento,
}: BaseParams): FatturaElettronica {
  const progressivo
        = tipoDocumento === "TD01" ? fattura.numeroProgressivo : fattura.numeroProgressivoNotaCredito;

  const dataFattura
        = tipoDocumento === "TD01" ? (fattura.dataEmissione || fattura.dataSaldo) : fattura.dataNotaCredito ?? new Date();

  const numeroFattura = `${randomstring.generate(
    5,
  )}-${progressivo}/${new Date(dataFattura).getFullYear()}`;

  const causale = fattura.articoli?.map(i => i.descrizione).join(" / ");

  const modalitaPagamento
      = fattura.metodoPagamento === FatturaMetodoPagamento.BONIFICO
        ? "MP05"
        : fattura.metodoPagamento === FatturaMetodoPagamento.CARTA
          ? "MP08"
          : fattura.metodoPagamento === FatturaMetodoPagamento.CONTANTI
            ? "MP01"
            : "";

  const DatiPagamento: DettaglioPagamento = {
    Beneficiario: nomeUtente,
    ModalitaPagamento: modalitaPagamento,
    ImportoPagamento: fattura.totaleFattura.toFixed(2),
  };

  if (fattura.metodoPagamento === FatturaMetodoPagamento.BONIFICO) {
    DatiPagamento.IstitutoFinanziario = partitaIva.ibanBanca || "";
    DatiPagamento.IBAN = partitaIva.iban || "";
  }

  const DatiAnagraficiCliente: DatiAnagrafici = {};

  if (cliente.partitaIva) {
    DatiAnagraficiCliente.IdFiscaleIVA = {
      IdPaese: cliente.paese,
      IdCodice: cliente.partitaIva,
    };
  }

  if (cliente.codiceFiscale) {
    DatiAnagraficiCliente.CodiceFiscale = cliente.codiceFiscale;
  }

  if (cliente.ragioneSociale) {
    DatiAnagraficiCliente.Anagrafica = {
      Denominazione: cliente.ragioneSociale,
    };
  }

  if (cliente.nome && cliente.cognome) {
    DatiAnagraficiCliente.Anagrafica = {
      Nome: cliente.nome,
      Cognome: cliente.cognome,
    };
  }

  const SedeCliente: any = {
    Indirizzo: cliente.indirizzo,
    CAP: cliente.cap,
    Comune: cliente.comune,
    Nazione: cliente.paese,
  };

  return {
    FatturaElettronicaHeader: {
      DatiTrasmissione: {
        IdTrasmittente: {
          IdPaese: "IT",
          IdCodice: partitaIva.codiceFiscale,
        },
        ProgressivoInvio: randomstring.generate(9),
        FormatoTrasmissione: "FPR12",
        CodiceDestinatario: cliente.paese === "IT" ? "0000000" : "XXXXXXX",
        ContattiTrasmittente: {
          Telefono: "3294339857",
          Email: "matteo.iafrate@pec.it",
        },
      },
      CedentePrestatore: {
        DatiAnagrafici: {
          IdFiscaleIVA: {
            IdPaese: "IT",
            IdCodice: partitaIva.numero,
          },
          CodiceFiscale: partitaIva.codiceFiscale,
          Anagrafica: {
            Denominazione: nomeUtente,
          },
          RegimeFiscale: "RF19",
        },
        Sede: {
          Indirizzo: partitaIva.indirizzo,
          CAP: partitaIva.cap,
          Comune: partitaIva.comune,
          Provincia: partitaIva.provincia,
          Nazione: partitaIva.paese,
        },
      },
      CessionarioCommittente: {
        DatiAnagrafici: DatiAnagraficiCliente,
        Sede: SedeCliente,
      },
      TerzoIntermediarioOSoggettoEmittente: {
        DatiAnagrafici: {
          IdFiscaleIVA: {
            IdPaese: "IT",
            IdCodice: "11359591002",
          },
          CodiceFiscale: "11359591002",
          Anagrafica: {
            Denominazione: "Matteo Iafrate",
          },
        },
      },
      SoggettoEmittente: "TZ",
    },
    FatturaElettronicaBody: {
      DatiGenerali: {
        DatiGeneraliDocumento: {
          TipoDocumento: tipoDocumento,
          Divisa: "EUR",
          Data: format(new Date(), "yyyy-MM-dd"),
          Numero: numeroFattura,
          ImportoTotaleDocumento: fattura.totaleFattura.toFixed(2),
          Causale: causale,
        },
      },
      DatiBeniServizi: {
        DettaglioLinee: {
          NumeroLinea: "1",
          Descrizione: causale,
          Quantita: "1.00",
          UnitaMisura: "pz",
          PrezzoUnitario: fattura.totaleFattura.toFixed(2),
          PrezzoTotale: fattura.totaleFattura.toFixed(2),
          AliquotaIVA: "0.00",
          Natura: "N2.2",
        },
        DatiRiepilogo: {
          AliquotaIVA: "0.00",
          Natura: "N2.2",
          ImponibileImporto: fattura.totaleFattura.toFixed(2),
          Imposta: "0.00",
          EsigibilitaIVA: "I",
        },
      },
      DatiPagamento: {
        CondizioniPagamento: "TP02",
        DettaglioPagamento: DatiPagamento,
      },
    },
  };
}

export function buildXml(params: BaseParams): string {
  const data = formatData(params);
  return fileEncode(data);
}
