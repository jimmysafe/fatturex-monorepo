import type {
  Client as SoapClient,
} from "soap";

import type { CancellazioneDocumentoSpesaRequest } from "./definitions/CancellazioneDocumentoSpesaRequest";

import type { CancellazioneDocumentoSpesaResponse } from "./definitions/CancellazioneDocumentoSpesaResponse";
import type { InserimentoDocumentoSpesaRequest } from "./definitions/InserimentoDocumentoSpesaRequest";
import type { InserimentoDocumentoSpesaResponse } from "./definitions/InserimentoDocumentoSpesaResponse";
import type { RimborsoDocumentoSpesaRequest } from "./definitions/RimborsoDocumentoSpesaRequest";
import type { RimborsoDocumentoSpesaResponse } from "./definitions/RimborsoDocumentoSpesaResponse";
import type { VariazioneDocumentoSpesaRequest } from "./definitions/VariazioneDocumentoSpesaRequest";
import type { VariazioneDocumentoSpesaResponse } from "./definitions/VariazioneDocumentoSpesaResponse";
import type { DocumentoSpesa730PService } from "./services/DocumentoSpesa730PService";
import {
  createClientAsync as soapCreateClientAsync,
} from "soap";

export interface DocumentoSpesa730PClient extends SoapClient {
  DocumentoSpesa730PPort: DocumentoSpesa730PService;
  InserimentoAsync: (
    inserimentoDocumentoSpesaRequest: InserimentoDocumentoSpesaRequest,
  ) => Promise<
    [
      result: InserimentoDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  VariazioneAsync: (
    variazioneDocumentoSpesaRequest: VariazioneDocumentoSpesaRequest,
  ) => Promise<
    [
      result: VariazioneDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  RimborsoAsync: (
    rimborsoDocumentoSpesaRequest: RimborsoDocumentoSpesaRequest,
  ) => Promise<
    [
      result: RimborsoDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
  CancellazioneAsync: (
    cancellazioneDocumentoSpesaRequest: CancellazioneDocumentoSpesaRequest,
  ) => Promise<
    [
      result: CancellazioneDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  >;
}

/** Create DocumentoSpesa730PClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<DocumentoSpesa730PClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
