import crypto from "node:crypto";

import { db } from "@repo/database/client";
import { FatturaMetodoPagamento, StsStato } from "@repo/database/lib/enums";
import { eq } from "@repo/database/lib/utils";
import { fattura as _fattura, partitaIva as _partitaIva, StsCancellazioneSchema, StsInvioSchema } from "@repo/database/schema";
import { format } from "date-fns";
import { BasicAuthSecurity } from "soap";
import { z } from "zod";
import { ZSAError } from "zsa";

import { env } from "@/env";

import type {
  CancellazioneDocumentoSpesaRequest,
  CancellazioneDocumentoSpesaResponse,
  DocumentoSpesa730PClient,
  InserimentoDocumentoSpesaRequest,
  InserimentoDocumentoSpesaResponse,
} from "./invioSincrono/documentospesa730p";

import {
  createClientAsync,
} from "./invioSincrono/documentospesa730p";

async function asyncClient(
  username: string,
  password: string,
): Promise<DocumentoSpesa730PClient> {
  const auth = `Basic ${Buffer.from(`${username}:${password}`).toString(
    "base64",
  )}`;

  //   const url = path.join(filesPath, "wsdl", "DocumentoSpesa730p.wsdl");
  const url = `${env.NEXT_PUBLIC_APP_URL}/api/sts/DocumentoSpesa730p`;

  const SoapClient = await createClientAsync(url, {
    wsdl_headers: { Authorization: auth },
  });

  SoapClient.setEndpoint(env.STS_URL);
  SoapClient.setSecurity(new BasicAuthSecurity(username, password));

  return SoapClient;
}

const InvioSchema = z.object({
  fatturaId: z.string(),
  userId: z.string(),
  dto: StsInvioSchema,
});

const CancellazioneSchema = z.object({
  fatturaId: z.string(),
  userId: z.string(),
  dto: StsCancellazioneSchema,
});

export async function invio({ dto, fatturaId, userId }: z.infer<typeof InvioSchema>) {
  const { username, password, pincode, flagOpposizione } = dto;

  const fattura = await db.query.fattura.findFirst({
    where: eq(_fattura.id, fatturaId),
    with: {
      cliente: true,
    },
  });
  if (!fattura)
    throw new ZSAError("NOT_FOUND", "Fattura non trovata");

  const partitaIva = await db.query.partitaIva.findFirst({
    where: eq(_partitaIva.userId, userId),
  });
  if (!partitaIva)
    throw new ZSAError("NOT_FOUND", "Partita IVA non trovata");

  const {
    dataEmissione,
    numeroProgressivo,
    totaleFattura,
    metodoPagamento,
    cliente,
  } = fattura;

  if (!cliente.codiceFiscale)
    throw new Error("Bad Request");

  try {
    // @ts-expect-error this is valid
    // eslint-disable-next-line node/no-process-env
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    const client = await asyncClient(username, password);

    const encodedPincode = await encode(pincode);
    const encodedCf = await encode(partitaIva.codiceFiscale);
    const encodedClientCf = await encode(cliente.codiceFiscale);

    if (!encodedPincode || !encodedCf)
      throw new Error("Invalid Pincode or CF encryption");

    const res = await inserimento(client, {
      opzionale1: "",
      opzionale2: "",
      opzionale3: "",
      pincode: encodedPincode,
      Proprietario: {
        cfProprietario: encodedCf,
      },
      idInserimentoDocumentoFiscale: {
        idSpesa: {
          pIva: partitaIva.numero,
          dataEmissione: format(dataEmissione, "yyyy-MM-dd"), // deve essere YYYY-MM-DD
          numDocumentoFiscale: {
            dispositivo: "1",
            numDocumento: `${numeroProgressivo}/${new Date(dataEmissione).getFullYear()}`,
          },
        },
        dataPagamento: format(dataEmissione, "yyyy-MM-dd"),
        cfCittadino: flagOpposizione
          ? undefined
          : encodedClientCf ?? undefined,
        voceSpesa: [
          {
            tipoSpesa: "SP",
            importo: totaleFattura.toString(),
            naturaIVA: "N4",
          },
        ],
        pagamentoTracciato:
            metodoPagamento === FatturaMetodoPagamento.CONTANTI ? "NO" : "SI",
        tipoDocumento: "F",
        flagOpposizione: flagOpposizione ? "1" : "0",
      },
    });

    return res[0];
  }
  catch (err: any) {
    throw new Error(err.message);
  }
}

export async function cancellazione({ dto, fatturaId, userId }: z.infer<typeof CancellazioneSchema>) {
  const { username, password, pincode } = dto;

  const fattura = await db.query.fattura.findFirst({
    where: eq(_fattura.id, fatturaId),
    with: {
      cliente: true,
    },
  });
  if (!fattura)
    throw new ZSAError("NOT_FOUND", "Fattura non trovata");

  const partitaIva = await db.query.partitaIva.findFirst({
    where: eq(_partitaIva.userId, userId),
  });
  if (!partitaIva)
    throw new ZSAError("NOT_FOUND", "Partita IVA non trovata");

  const { numeroProgressivo, dataEmissione } = fattura;

  // @ts-expect-error this is valid
  // eslint-disable-next-line node/no-process-env
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  const client = await asyncClient(username, password);

  const encodedPincode = await encode(pincode);
  const encodedCf = await encode(partitaIva.codiceFiscale);

  if (!encodedPincode || !encodedCf)
    throw new Error("Invalid Pincode or CF encryption");
  const res = await inserimentoCancellazione(client, {
    opzionale1: "",
    opzionale2: "",
    opzionale3: "",
    pincode: encodedPincode,
    Proprietario: {
      cfProprietario: encodedCf,
    },
    idCancellazioneDocumentoFiscale: {
      pIva: partitaIva.numero,
      dataEmissione: format(dataEmissione, "yyyy-MM-dd"), // deve essere YYYY-MM-DD
      numDocumentoFiscale: {
        dispositivo: "1",
        numDocumento: `${numeroProgressivo}/${new Date(dataEmissione).getFullYear()}`,
      },
    },
  });

  await db.update(_fattura).set({
    stsProtocollo: "",
    stsStato: StsStato.CANCELLATA,
  }).where(eq(_fattura.id, fattura.id));

  return res[0];
}

/**
 * Inserisce dati pagamento nel sistema TS
 * @param client DocumentoSpesa730PClient
 * @param data InserimentoDocumentoSpesaRequest
 * @returns Promise
 */
async function inserimento(
  client: DocumentoSpesa730PClient,
  data: InserimentoDocumentoSpesaRequest,
): Promise<
    [
      result: InserimentoDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  > {
  return client.InserimentoAsync({
    opzionale1: "",
    opzionale2: "",
    opzionale3: "",
    pincode: data.pincode,
    Proprietario: data.Proprietario,
    idInserimentoDocumentoFiscale: data.idInserimentoDocumentoFiscale,
  });
}

/**
 * Cancellazione dati pagamento nel sistema TS
 * @param client DocumentoSpesa730PClient
 * @param data CancellazioneDocumentoSpesaRequest
 * @returns Promise
 */
async function inserimentoCancellazione(
  client: DocumentoSpesa730PClient,
  data: CancellazioneDocumentoSpesaRequest,
): Promise<
    [
      result: CancellazioneDocumentoSpesaResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ]
  > {
  return client.CancellazioneAsync({
    opzionale1: "",
    opzionale2: "",
    opzionale3: "",
    pincode: data.pincode,
    Proprietario: data.Proprietario,
    idCancellazioneDocumentoFiscale: data.idCancellazioneDocumentoFiscale,
  });
}

/**
 * Codifica param con pubkey SanitelCF.cer in base64
 * @param str Cosa codificare
 * @returns string | null
 */
async function encode(str: string) {
  try {
    const cert = Buffer.from(env.STS_CERTIFICATE, "utf-8");
    const encrypted = crypto.publicEncrypt(
      {
        key: cert,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(str),
    );

    return encrypted.toString("base64");
  }
  catch (err) {
    console.error("STS Encode Certificate Error: ", err);
    return null;
  }
}
