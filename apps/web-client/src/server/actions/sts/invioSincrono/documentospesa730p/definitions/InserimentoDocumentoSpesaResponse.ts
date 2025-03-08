import type { ListaMessaggi } from "./ListaMessaggi";

/** inserimentoDocumentoSpesaResponse */
export interface InserimentoDocumentoSpesaResponse {
  /** xs:string */
  esitoChiamata?: string;
  /** xs:string */
  protocollo?: string;
  /** listaMessaggi */
  listaMessaggi?: ListaMessaggi;
}
