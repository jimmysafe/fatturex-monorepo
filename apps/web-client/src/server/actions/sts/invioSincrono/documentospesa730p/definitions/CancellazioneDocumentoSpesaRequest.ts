import type { IdSpesa } from "./IdSpesa";
import type { Proprietario } from "./Proprietario";

/** cancellazioneDocumentoSpesaRequest */
export interface CancellazioneDocumentoSpesaRequest {
  /** xs:string */
  opzionale1?: string;
  /** xs:string */
  opzionale2?: string;
  /** xs:string */
  opzionale3?: string;
  /** xs:string */
  pincode?: string;
  /** Proprietario */
  Proprietario?: Proprietario;
  /** idCancellazioneDocumentoFiscale */
  idCancellazioneDocumentoFiscale?: IdSpesa;
}
