import { z } from "zod";

export const FtePayloadSchema = z.object({
  fattura_elettronica_header: z.object({
    dati_trasmissione: z.object({
      id_trasmittente: z.object({
        id_paese: z.string(),
        id_codice: z.string(),
      }),
      progressivo_invio: z.string(),
      formato_trasmissione: z.string(),
      codice_destinatario: z.string(),
      contatti_trasmittente: z.object({
        telefono: z.string(),
        email: z.string(),
      }),
      pec_destinatario: z.string().nullable(),
    }),
    cedente_prestatore: z.object({
      dati_anagrafici: z.object({
        id_fiscale_iva: z.object({
          id_paese: z.string(),
          id_codice: z.string(),
        }),
        codice_fiscale: z.string(),
        anagrafica: z.object({
          denominazione: z.string(),
          nome: z.string().nullable(),
          cognome: z.string().nullable(),
          titolo: z.string().nullable(),
          cod_eori: z.string().nullable(),
        }),
        albo_professionale: z.string().nullable(),
        provincia_albo: z.string().nullable(),
        numero_iscrizione_albo: z.string().nullable(),
        data_iscrizione_albo: z.string().nullable(),
        regime_fiscale: z.string(),
      }),
      sede: z.object({
        indirizzo: z.string(),
        numero_civico: z.string().nullable(),
        cap: z.string(),
        comune: z.string(),
        provincia: z.string(),
        nazione: z.string(),
      }),
      stabile_organizzazione: z.string().nullable(),
      iscrizione_rea: z.string().nullable(),
      contatti: z.string().nullable(),
      riferimento_amministrazione: z.string().nullable(),
    }),
    rappresentante_fiscale: z.string().nullable(),
    cessionario_committente: z.object({
      dati_anagrafici: z.object({
        id_fiscale_iva: z.object({
          id_paese: z.string(),
          id_codice: z.string(),
        }),
        codice_fiscale: z.string(),
        anagrafica: z.object({
          denominazione: z.string(),
          nome: z.string().nullable(),
          cognome: z.string().nullable(),
          titolo: z.string().nullable(),
          cod_eori: z.string().nullable(),
        }),
      }),
      sede: z.object({
        indirizzo: z.string(),
        numero_civico: z.string().nullable(),
        cap: z.string(),
        comune: z.string(),
        provincia: z.string(),
        nazione: z.string(),
      }),
      stabile_organizzazione: z.string().nullable(),
      rappresentante_fiscale: z.string().nullable(),
    }),
    terzo_intermediario_o_soggetto_emittente: z.object({
      dati_anagrafici: z.object({
        id_fiscale_iva: z.object({
          id_paese: z.string(),
          id_codice: z.string(),
        }),
        codice_fiscale: z.string(),
        anagrafica: z.object({
          denominazione: z.string(),
          nome: z.string().nullable(),
          cognome: z.string().nullable(),
          titolo: z.string().nullable(),
          cod_eori: z.string().nullable(),
        }),
      }),
    }),
    soggetto_emittente: z.string(),
  }),
  fattura_elettronica_body: z.array(
    z.object({
      dati_generali: z.object({
        dati_generali_documento: z.object({
          tipo_documento: z.string(),
          divisa: z.string(),
          data: z.string(),
          numero: z.string(),
          dati_ritenuta: z.string().nullable(),
          dati_bollo: z.string().nullable(),
          dati_cassa_previdenziale: z.string().nullable(),
          sconto_maggiorazione: z.string().nullable(),
          importo_totale_documento: z.string(),
          arrotondamento: z.string().nullable(),
          causale: z.array(z.string()),
          art73: z.string().nullable(),
        }),
        dati_ordine_acquisto: z.string().nullable(),
        dati_contratto: z.string().nullable(),
        dati_convenzione: z.string().nullable(),
        dati_ricezione: z.string().nullable(),
        dati_fatture_collegate: z.string().nullable(),
        dati_sal: z.string().nullable(),
        dati_ddt: z.string().nullable(),
        dati_trasporto: z.string().nullable(),
        fattura_principale: z.string().nullable(),
      }),
      dati_beni_servizi: z.object({
        dettaglio_linee: z.array(
          z.object({
            numero_linea: z.number(),
            tipo_cessione_prestazione: z.string().nullable(),
            codice_articolo: z.string().nullable(),
            descrizione: z.string(),
            quantita: z.string(),
            unita_misura: z.string(),
            data_inizio_periodo: z.string().nullable(),
            data_fine_periodo: z.string().nullable(),
            prezzo_unitario: z.string(),
            sconto_maggiorazione: z.string().nullable(),
            prezzo_totale: z.string(),
            aliquota_iva: z.string(),
            ritenuta: z.string().nullable(),
            natura: z.string(),
            riferimento_amministrazione: z.string().nullable(),
            altri_dati_gestionali: z.string().nullable(),
          }),
        ),
        dati_riepilogo: z.array(
          z.object({
            aliquota_iva: z.string(),
            natura: z.string(),
            spese_accessorie: z.string().nullable(),
            arrotondamento: z.string().nullable(),
            imponibile_importo: z.string(),
            imposta: z.string(),
            esigibilita_iva: z.string(),
            riferimento_normativo: z.string().nullable(),
          }),
        ),
      }),
      dati_veicoli: z.string().nullable(),
      dati_pagamento: z.array(
        z.object({
          condizioni_pagamento: z.string(),
          dettaglio_pagamento: z.array(
            z.object({
              beneficiario: z.string(),
              modalita_pagamento: z.string(),
              data_riferimento_termini_pagamento: z.string().nullable(),
              giorni_termini_pagamento: z.string().nullable(),
              data_scadenza_pagamento: z.string().nullable(),
              importo_pagamento: z.string(),
              cod_ufficio_postale: z.string().nullable(),
              cognome_quietanzante: z.string().nullable(),
              nome_quietanzante: z.string().nullable(),
              cf_quietanzante: z.string().nullable(),
              titolo_quietanzante: z.string().nullable(),
              istituto_finanziario: z.string(),
              iban: z.string(),
              abi: z.string().nullable(),
              cab: z.string().nullable(),
              bic: z.string().nullable(),
              sconto_pagamento_anticipato: z.string().nullable(),
              data_limite_pagamento_anticipato: z.string().nullable(),
              penalita_pagamenti_ritardati: z.string().nullable(),
              data_decorrenza_penale: z.string().nullable(),
              codice_pagamento: z.string().nullable(),
            }),
          ),
        }),
      ),
    }),
  ),
});

export const FteInvioSchema = z.object({});

export const FteResponseSchema = z.object({
  data: z.object({
    uuid: z.string(),
  }).nullable(),
  message: z.string().optional(),
  success: z.boolean(),
  error: z.string(),
});

export const FteConfigurationResponseSchema = z.object({
  data: z.object({
    id: z.string(),
  }).nullable(),
  message: z.string().optional(),
  success: z.boolean(),
  error: z.string(),
});

// export const FteNotificaSchema = z.object({
//   event: z.enum(['customer-invoice']),
//   data: z.object({
//     invoice: z.object({
//       uuid: z.string().uuid(),
//       created_at: z.string(),
//       filename: z.string(),
//       file_id: z.number(),
//       payload: z.any()
//     }),
//   })
// })
