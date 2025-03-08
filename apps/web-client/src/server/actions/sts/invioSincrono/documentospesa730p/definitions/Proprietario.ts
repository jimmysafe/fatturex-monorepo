/**
 * Proprietario
 * @targetNSAlias `__tns__`
 * @targetNamespace `http://documentospesap730.sanita.finanze.it`
 */
export interface Proprietario {
  /** varChar3Type|xs:string|pattern */
  codiceRegione?: string;
  /** varChar3Type|xs:string|pattern */
  codiceAsl?: string;
  /** codSsaType|xs:string|pattern */
  codiceSSA?: string;
  /** cfType|xs:string|maxLength */
  cfProprietario?: string;
}
