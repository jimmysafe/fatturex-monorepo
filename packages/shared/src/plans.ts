export interface Plan {
  label: string;
  numberOfInvoices: number;
  numberOfSearches: number;
  fteEnabled: boolean;
  price: {
    monthly: number;
    yearly: number;
  };
  priceId: string;
  features: string[];
  actionLabel: string;
}

export const DEFAULT_NUMBER_OF_INVOICES = 3;
export const DEFAULT_NUMBER_OF_SEARCHES = 0;

export const plans: Plan[] = [
  {
    label: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    numberOfInvoices: DEFAULT_NUMBER_OF_INVOICES,
    numberOfSearches: DEFAULT_NUMBER_OF_SEARCHES,
    fteEnabled: false,
    priceId: "price_1R1vc7QoWkXedzknTCxpet4i",
    actionLabel: "Inizia Ora",
    features: [
      "3 fatture al mese",
    ],
  },
  {
    label: "Base",
    price: {
      monthly: 4.99,
      yearly: 4.99,
    },
    numberOfInvoices: 10,
    numberOfSearches: 3,
    fteEnabled: true,
    priceId: "price_1R1vevQoWkXedzknNGlNiF0S",
    actionLabel: "Acquista",
    features: [
      "10 Fatture al mese",
      "3 Ricerche Azienda al mese",
      "Fatturazione Elettronica",
      "Invio al Sistema Tessera Sanitaria",
      "Personalizzazione Fattura",
    ],
  },
  {
    label: "Pro",
    price: {
      monthly: 6.99,
      yearly: 6.99,
    },
    numberOfInvoices: -1,
    numberOfSearches: 8,
    fteEnabled: true,
    priceId: "price_1R1vcmQoWkXedzknWhuOxY9D",
    actionLabel: "Acquista",
    features: [
      "Fatture illimitate",
      "8 Ricerche Azienda al mese",
      "Fatturazione Elettronica",
      "Invio al Sistema Tessera Sanitaria",
      "Personalizzazione Fattura",
      "Assistenza 24/7",
    ],
  },
];
