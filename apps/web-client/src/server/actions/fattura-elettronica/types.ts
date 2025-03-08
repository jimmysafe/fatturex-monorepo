import { z } from "zod";

export type TipoDocumento = "TD01" | "TD04";

export interface DatiRiepilogo {
  AliquotaIVA: string;
  Natura?: string;
  ImponibileImporto: string;
  Imposta: string;
  EsigibilitaIVA: string;
};

export interface DettaglioLinee {
  NumeroLinea: string;
  Descrizione: string;
  Quantita: string;
  UnitaMisura: string;
  PrezzoUnitario: string;
  PrezzoTotale: string;
  AliquotaIVA: string;
  Natura?: string;
};

export interface DatiBeniServizi {
  DettaglioLinee: DettaglioLinee;
  DatiRiepilogo: DatiRiepilogo;
};

export interface DatiGeneraliDocumento {
  TipoDocumento: string;
  Divisa: string;
  Data: string;
  Numero: string;
  ImportoTotaleDocumento: string;
  Causale: string;
};

export interface DatiGenerali {
  DatiGeneraliDocumento: DatiGeneraliDocumento;
};

export interface DettaglioPagamento {
  Beneficiario: string;
  ModalitaPagamento: string;
  ImportoPagamento: string;
  IstitutoFinanziario?: string;
  IBAN?: string;
};

export interface DatiPagamento {
  CondizioniPagamento: string;
  DettaglioPagamento: DettaglioPagamento;
};

export interface ID {
  IdPaese: string;
  IdCodice: string;
};

export interface ContattiTrasmittente {
  Telefono: string;
  Email: string;
};

export interface DatiTrasmissione {
  IdTrasmittente: ID;
  ProgressivoInvio: string;
  FormatoTrasmissione: string;
  CodiceDestinatario: string;
  ContattiTrasmittente: ContattiTrasmittente;
  PECDestinatario?: string;
};

export interface Anagrafica {
  Denominazione?: string;
  Nome?: string;
  Cognome?: string;
};

export interface DatiAnagrafici {
  IdFiscaleIVA?: ID;
  CodiceFiscale?: string;
  Anagrafica?: Anagrafica;
  RegimeFiscale?: string;
};

export interface Sede {
  Indirizzo: string;
  CAP: string;
  Comune: string;
  Provincia: string;
  Nazione: string;
};

export interface IscrizioneREA {
  Ufficio: string;
  NumeroREA: string;
  CapitaleSociale: string;
  SocioUnico: string;
  StatoLiquidazione: string;
};

export interface CedentePrestatore {
  DatiAnagrafici: DatiAnagrafici;
  Sede: Sede;
  IscrizioneREA?: IscrizioneREA;
};

export interface CessionarioCommittente {
  DatiAnagrafici: DatiAnagrafici;
  Sede: Sede;
};

export interface TerzoIntermediarioOSoggettoEmittente {
  DatiAnagrafici: DatiAnagrafici;
};

export interface FatturaElettronicaHeader {
  DatiTrasmissione: DatiTrasmissione;
  CedentePrestatore: CedentePrestatore;
  CessionarioCommittente: CessionarioCommittente;
  TerzoIntermediarioOSoggettoEmittente: TerzoIntermediarioOSoggettoEmittente;
  SoggettoEmittente: string;
};

export interface FatturaElettronicaBody {
  DatiGenerali: DatiGenerali;
  DatiBeniServizi: DatiBeniServizi;
  DatiPagamento: DatiPagamento;
};

export interface FatturaElettronica {
  FatturaElettronicaHeader: FatturaElettronicaHeader;
  FatturaElettronicaBody: FatturaElettronicaBody;
};

export interface FatturaElettronicaNotificationResponse {
  event: string;
  data: {
    notification: {
      uuid: string;
      invoice_uuid: string;
      created_at: string;
      type: string;
      file_name: string;
      message: {
        identificativo_sdi: string;
        nome_file: string;
        data_ora_ricezione: string;
        riferimento_archivio: {
          identificativo_sdi: string;
          nome_file: string;
        };
        lista_errori: {
          Errore: {
            Codice: string;
            Descrizione: string;
          };
        };
        message_id: string;
        note: string;
      };
      downloaded: boolean;
    };
  };
}

export const FatturaElettronicaNotificationSchema = z.object({
  event: z.string(),
  data: z.object({
    notification: z.object({
      uuid: z.string(),
      invoice_uuid: z.string().optional(),
      created_at: z.string().optional(),
      type: z.string().optional(),
      file_name: z.string().optional(),
      message: z.object({
        identificativo_sdi: z.string().optional(),
        nome_file: z.string().optional(),
        data_ora_ricezione: z.string().optional(),
        riferimento_archivio: z.object({
          identificativo_sdi: z.string().optional(),
          nome_file: z.string().optional(),
        }).strict().optional(),
        lista_errori: z.object({
          Errore: z.object({
            Codice: z.string().optional(),
            Descrizione: z.string().optional(),
          }).strict().optional(),
        }).strict().optional(),
        message_id: z.string().optional(),
        note: z.string().optional(),
      }).strict().optional(),
      downloaded: z.boolean().optional(),
    }),
  }),
});
