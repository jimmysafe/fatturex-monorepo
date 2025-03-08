// To parse this data:
//
//   import { Convert, SearchClienteResponse } from "./file";
//
//   const searchClienteResponse = Convert.toSearchClienteResponse(json);

export interface SearchClienteResponse {
  data: SearchCliente[];
  success: boolean;
  message: string;
  error: null;
}

export interface SearchCliente {
  taxCode: string;
  companyName: string;
  vatCode: string;
  address: Address;
  activityStatus: string;
  reaCode: string;
  cciaa: string;
  atecoClassification: AtecoClassification;
  detailedLegalForm: DetailedLegalForm;
  startDate: string;
  registrationDate: Date;
  endDate: null;
  pec: string;
  cessata: boolean;
  taxCodeCeased: number;
  taxCodeCeasedTimestamp: number;
  gruppo_iva: GruppoIva;
  sdiCode: string;
  sdiCodeTimestamp: number;
  creationTimestamp: number;
  lastUpdateTimestamp: number;
  balanceSheets: BalanceSheets;
  shareHolders: ShareHolder[];
  id: string;
}

export interface Address {
  registeredOffice: RegisteredOffice;
}

export interface RegisteredOffice {
  toponym: string;
  street: string;
  streetNumber: string;
  streetName: string;
  town: string;
  hamlet: null;
  province: string;
  zipCode: string;
  gps: Gps;
  townCode: string;
  region: DetailedLegalForm;
}

export interface Gps {
  coordinates: number[];
}

export interface DetailedLegalForm {
  code: string;
  description: string;
}

export interface AtecoClassification {
  ateco: DetailedLegalForm;
}

export interface BalanceSheets {
  last: Last;
  all: Last[];
}

export interface Last {
  year: number;
  employees: number | null;
  balanceSheetDate: Date | null;
  turnover: number | null;
  netWorth: number | null;
  shareCapital: number | null;
  totalStaffCost?: number;
  totalAssets?: number;
  avgGrossSalary?: number;
}

export interface GruppoIva {
  vatGroupParticipation: boolean;
  isVatGroupLeader: boolean;
  registryOk: boolean;
}

export interface ShareHolder {
  companyName: string;
  name: null;
  surname: null;
  taxCode: string;
  percentShare: number;
}
