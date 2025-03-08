import type { CancellazioneDocumentoSpesaRequest } from "../definitions/CancellazioneDocumentoSpesaRequest";
import type { CancellazioneDocumentoSpesaResponse } from "../definitions/CancellazioneDocumentoSpesaResponse";
import type { InserimentoDocumentoSpesaRequest } from "../definitions/InserimentoDocumentoSpesaRequest";
import type { InserimentoDocumentoSpesaResponse } from "../definitions/InserimentoDocumentoSpesaResponse";
import type { RimborsoDocumentoSpesaRequest } from "../definitions/RimborsoDocumentoSpesaRequest";
import type { RimborsoDocumentoSpesaResponse } from "../definitions/RimborsoDocumentoSpesaResponse";
import type { VariazioneDocumentoSpesaRequest } from "../definitions/VariazioneDocumentoSpesaRequest";
import type { VariazioneDocumentoSpesaResponse } from "../definitions/VariazioneDocumentoSpesaResponse";

export interface DocumentoSpesa730PPort {
  Inserimento: (
    inserimentoDocumentoSpesaRequest: InserimentoDocumentoSpesaRequest,
    callback: (
      err: any,
      result: InserimentoDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ) => void;
  Variazione: (
    variazioneDocumentoSpesaRequest: VariazioneDocumentoSpesaRequest,
    callback: (
      err: any,
      result: VariazioneDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ) => void;
  Rimborso: (
    rimborsoDocumentoSpesaRequest: RimborsoDocumentoSpesaRequest,
    callback: (
      err: any,
      result: RimborsoDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ) => void;
  Cancellazione: (
    cancellazioneDocumentoSpesaRequest: CancellazioneDocumentoSpesaRequest,
    callback: (
      err: any,
      result: CancellazioneDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ) => void;
}
