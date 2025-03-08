import type { IdInserimentoDocumentoFiscale } from "./IdInserimentoDocumentoFiscale";
import type { Proprietario } from "./Proprietario";

/** variazioneDocumentoSpesaRequest */
export interface VariazioneDocumentoSpesaRequest {
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
  /** idVariazioneDocumentoFiscale */
  idVariazioneDocumentoFiscale?: IdInserimentoDocumentoFiscale;
}
