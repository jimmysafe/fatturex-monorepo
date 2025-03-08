/** voceSpesa */
export interface VoceSpesa {
  /** xs:string|TK,FC,FV,AS,SR,CT,PI,IC,AA,AD,SV,SP */
  tipoSpesa?: string;
  /** xs:string|1,2 */
  flagTipoSpesa?: string;
  /** xs:double */
  importo?: string;
  /** RateType|xs:decimal|maxInclusive,pattern */
  aliquotaIVA?: string;
  /** NaturaType|xs:string|minLength,maxLength */
  naturaIVA?: string;
}
