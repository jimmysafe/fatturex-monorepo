import type { ListaMessaggi1 } from "./ListaMessaggi1";

/** variazioneDocumentoSpesaResponse */
export interface VariazioneDocumentoSpesaResponse {
  /** xs:string */
  esitoChiamata?: string;
  /** xs:string */
  protocollo?: string;
  /** listaMessaggi */
  listaMessaggi?: ListaMessaggi1;
}
