import type { IdInserimentoDocumentoFiscale } from "./IdInserimentoDocumentoFiscale";
import type { Proprietario } from "./Proprietario";

/** inserimentoDocumentoSpesaRequest */
export interface InserimentoDocumentoSpesaRequest {
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
  /** idInserimentoDocumentoFiscale */
  idInserimentoDocumentoFiscale?: IdInserimentoDocumentoFiscale;
}
