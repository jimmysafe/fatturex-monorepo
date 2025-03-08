import type { IdInserimentoDocumentoFiscale } from "./IdInserimentoDocumentoFiscale";
import type { IdSpesa } from "./IdSpesa";
import type { Proprietario } from "./Proprietario";

/** rimborsoDocumentoSpesaRequest */
export interface RimborsoDocumentoSpesaRequest {
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
  /** idRimborsoDocumentoFiscale */
  idRimborsoDocumentoFiscale?: IdSpesa;
  /** DocumentoSpesa */
  DocumentoSpesa?: IdInserimentoDocumentoFiscale;
}
