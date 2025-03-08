export interface FatturaPdfLocale {
  fattura: string;
  partita_iva: string;
  codice_fiscale: string;
  email: string;
  indirizzo: string;
  numero_fattura: string;
  descrizione: string;
  costo_unitario: string;
  quantita: string;
  importo: string;
  data_emissione: string;
  data_saldo: string;
  destinatario: string;
  intestatario_iban: string;
  imponibile: string;
  contributo: string;
  marca_da_bollo: string;
  banca: string;
  annullata: string;
  nota_di_credito: string;
  data_nota_di_credito: string;
  id_marca_da_bollo: string;
  preferenza_data_saldo: string;
  giorni: string;
  metodo_pagamento_carta: string;
  legal_note_1: string;
  legal_note_2: string;
}

export const pdfLocales: Record<string, FatturaPdfLocale> = {
  EN: {
    fattura: "Invoice",
    partita_iva: "VAT Number",
    codice_fiscale: "Tax ID",
    email: "Email",
    indirizzo: "Address",
    numero_fattura: "Invoice Number",
    descrizione: "Description",
    costo_unitario: "Unit Amount",
    quantita: "Quantity",
    importo: "Total",
    data_emissione: "Issued on",
    data_saldo: "Payment Date",
    destinatario: "TO",
    intestatario_iban: "NAME",
    imponibile: "Subtotal",
    contributo: "Taxes",
    marca_da_bollo: "Tax Stamp",
    banca: "BANK NAME",
    annullata: "CANCELLED",
    nota_di_credito: "Credit Memo",
    data_nota_di_credito: "Credit Memo Date",
    id_marca_da_bollo: "Tax Stamp ID",
    preferenza_data_saldo: "Due by",
    giorni: "Days",
    metodo_pagamento_carta: "Payment Method: CARD",
    legal_note_1:
        "Document without fiscal value according to Article 21 of Italian Legislative Decree 633/72. The original is available at the electronic address provided by you or in your reserved area of the Agenzia delle Entrate.",
    legal_note_2:
        "Operation under VAT exemption according to Italian Law 190 of December 23, 2014, Article 1, paragraphs 54 to 89 - Lump-sum Regime. The compensation is not subject to withholding tax according to Italian Law 190 of December 23, 2014, Article 1, paragraph 67.",
  },
  IT: {
    fattura: "Fattura",
    partita_iva: "Partita IVA",
    codice_fiscale: "Codice Fiscale",
    email: "Email",
    indirizzo: "Indirizzo",
    numero_fattura: "Numero Fattura",
    descrizione: "Descrizione",
    costo_unitario: "Costo Unitario",
    quantita: "Quantità",
    importo: "Importo",
    data_emissione: "Data Emissione",
    data_saldo: "Data Saldo",
    destinatario: "DESTINATARIO",
    intestatario_iban: "INTESTATARIO",
    imponibile: "Imponibile",
    contributo: "Contributo",
    marca_da_bollo: "Marca da Bollo",
    banca: "BANCA",
    annullata: "ANNULLATA",
    nota_di_credito: "Nota di Credito",
    data_nota_di_credito: "Data Nota di Credito",
    id_marca_da_bollo: "ID Marca da Bollo",
    preferenza_data_saldo: "Da Saldare entro",
    giorni: "Giorni",
    metodo_pagamento_carta: "Metodo di Pagamento: Carta",
    legal_note_1:
        "Documento privo di valenza fiscale ai sensi dell'art. 21 Dpr 633/72. L'originale è disponibile all'indirizzo telematico da Lei fornito oppure nella Sua area riservata dell'Agenzia delle Entrate.",
    legal_note_2:
        "Operazione in franchigia da IVA ai sensi della Legge 190 del 23 dicembre 2014 art. 1 commi da 54 a 89 - Regime Forfettario. Il compenso non è soggetto a ritenute d'acconto ai sensi della legge 190 del 23 dicembre 2014 art. 1, comma 67",
  },
};
