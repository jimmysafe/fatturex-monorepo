import type { ListaMessaggi2 } from "./ListaMessaggi2";

/** rimborsoDocumentoSpesaResponse */
export interface RimborsoDocumentoSpesaResponse {
  /** xs:string */
  esitoChiamata?: string;
  /** xs:string */
  protocollo?: string;
  /** listaMessaggi */
  listaMessaggi?: ListaMessaggi2;
}
