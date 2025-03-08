import type { ListaMessaggi3 } from "./ListaMessaggi3";

/** cancellazioneDocumentoSpesaResponse */
export interface CancellazioneDocumentoSpesaResponse {
  /** xs:string */
  esitoChiamata?: string;
  /** xs:string */
  protocollo?: string;
  /** listaMessaggi */
  listaMessaggi?: ListaMessaggi3;
}
