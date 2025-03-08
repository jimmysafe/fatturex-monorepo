import type { NumDocumentoFiscale } from "./NumDocumentoFiscale";

/**
 * idSpesa
 * @targetNSAlias `__tns__`
 * @targetNamespace `http://documentospesap730.sanita.finanze.it`
 */
export interface IdSpesa {
  /** xs:integer|pattern */
  pIva?: string;
  /** DataMinType|minInclusive */
  dataEmissione?: string;
  /** numDocumentoFiscale */
  numDocumentoFiscale?: NumDocumentoFiscale;
}
