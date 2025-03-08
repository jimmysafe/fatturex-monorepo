import type { IdSpesa } from "./IdSpesa";
import type { VoceSpesa } from "./VoceSpesa";

/**
 * idInserimentoDocumentoFiscale
 * @targetNSAlias `__tns__`
 * @targetNamespace `http://documentospesap730.sanita.finanze.it`
 */
export interface IdInserimentoDocumentoFiscale {
  /** idSpesa */
  idSpesa?: IdSpesa;
  /** DataMinType|xs:date|minInclusive,pattern */
  dataPagamento?: string;
  /** xs:int|1 */
  flagPagamentoAnticipato?: string;
  /** cfType|xs:string|maxLength */
  cfCittadino?: string;
  /** voceSpesa[] */
  voceSpesa?: Array<VoceSpesa>;
  /** xs:string|SI,NO */
  pagamentoTracciato?: string;
  /** xs:string|F,D */
  tipoDocumento?: string;
  /** xs:string|0,1 */
  flagOpposizione?: string;
}
