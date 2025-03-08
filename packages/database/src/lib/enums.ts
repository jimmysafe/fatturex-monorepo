export const UserRoles = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRolesType = typeof UserRoles[keyof typeof UserRoles];
export const UserRolesValues = Object.values(UserRoles);

export const UserCassa = {
  GESTIONE_SEPARATA: "Gestione Separata",
  ENPAP: "Enpap",
  ENPAM: "Enpam",
  ENPAPI: "Enpapi",
  CASSA_FORENSE: "Cassa Forense",
} as const;

export type UserCassaType = typeof UserCassa[keyof typeof UserCassa];
export const UserCassaValues = Object.values(UserCassa);

export const EnpapiTipoAgevolazione = {
  NOT_SET: "NOT_SET",
  NONE: "NONE",
  PART_TIME_50: "PART_TIME_50",
  PART_TIME_99: "PART_TIME_99",
  FULL_TIME: "FULL_TIME",
} as const;

export type EnpapiTipoAgevolazioneType = typeof EnpapiTipoAgevolazione[keyof typeof EnpapiTipoAgevolazione];
export const EnpapiTipoAgevolazioneValues = Object.values(EnpapiTipoAgevolazione);

export const FatturaStato = {
  EMESSA: "Emessa",
  SALDATA: "Saldata",
  ANNULLATA: "Annullata",
} as const;

export type FatturaStatoType = typeof FatturaStato[keyof typeof FatturaStato];
export const FatturaStatoValues = Object.values(FatturaStato);

export const FatturaMetodoPagamento = {
  CARTA: "Carta",
  BONIFICO: "Bonifico",
  CONTANTI: "Contanti",
} as const;

export type FatturaMetodoPagamentoType = typeof FatturaMetodoPagamento[keyof typeof FatturaMetodoPagamento];
export const FatturaMetodoPagamentoValues = Object.values(FatturaMetodoPagamento);

export const FatturaPreferenzaDataSaldo = {
  IMMEDIATO: "0",
  TRENTA: "30",
  SESSANTA: "60",
  NOVANTA: "90",
} as const;

export type FatturaPreferenzaDataSaldoType = typeof FatturaPreferenzaDataSaldo[keyof typeof FatturaPreferenzaDataSaldo];
export const FatturaPreferenzaDataSaldoValues = Object.values(FatturaPreferenzaDataSaldo);

export const StsStato = {
  NON_INVIATA: "Non Inviata",
  INVIATA: "Inviata",
  CANCELLATA: "Cancellata",
} as const;

export type StsStatoType = typeof StsStato[keyof typeof StsStato];
export const StsStatoValues = Object.values(StsStato);

export const FteStato = {
  SCARTATA: "Scartata",
  NON_INVIATA: "Non Inviata",
  INVIATA: "Inviata",
  ANNULLATA: "Annullata",
  PROCESSING: "In Elaborazione",
} as const;

export type FteStatoType = typeof FteStato[keyof typeof FteStato];
export const FteStatoValues = Object.values(FteStato);

export const SubscriptionStato = {
  ATTIVO: "Attivo",
  CANCELLATO: "Cancellato",
  SCADUTO: "Scaduto",
  PAGAMENTO_RICHIESTO: "Pagamento Richiesto",
} as const;

export type SubscriptionStatoType = typeof SubscriptionStato[keyof typeof SubscriptionStato];
export const SubscriptionStatoValues = Object.values(SubscriptionStato);
