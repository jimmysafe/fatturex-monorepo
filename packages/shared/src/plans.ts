/* eslint-disable node/no-process-env */

type PlanLabel = "Free" | "Base" | "Pro";

export interface Plan {
  label: PlanLabel;
  numberOfInvoices: number;
  numberOfSearches: number;
  fteEnabled: boolean;
  price: {
    monthly: {
      id: string;
      amount: number;
    };
    yearly: {
      id: string;
      amount: number;
    };
  };
  features: string[];
  actionLabel: string;
}

export const DEFAULT_NUMBER_OF_INVOICES = 3;
export const DEFAULT_NUMBER_OF_SEARCHES = 0;

export const plans: Plan[] = [
  {
    label: "Free",
    price: {
      monthly: {
        id: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRICE_ID_MONTHLY_FREE!,
        amount: 0,
      },
      yearly: {
        id: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRICE_ID_YEARLY_FREE!,
        amount: 0,
      },
    },
    numberOfInvoices: DEFAULT_NUMBER_OF_INVOICES,
    numberOfSearches: DEFAULT_NUMBER_OF_SEARCHES,
    fteEnabled: false,
    actionLabel: "Inizia Ora",
    features: [
      "3 fatture al mese",
    ],
  },
  {
    label: "Base",
    price: {
      monthly: {
        id: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRICE_ID_MONTHLY_BASE!,
        amount: 4.99,
      },
      yearly: {
        id: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRICE_ID_YEARLY_BASE!,
        amount: 48.00,
      },
    },
    numberOfInvoices: 10,
    numberOfSearches: 3,
    fteEnabled: true,
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
      monthly: {
        id: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRICE_ID_MONTHLY_PRO!,
        amount: 6.99,
      },
      yearly: {
        id: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRICE_ID_YEARLY_PRO!,
        amount: 70.00,
      },
    },
    numberOfInvoices: -1,
    numberOfSearches: 8,
    fteEnabled: true,
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

export function getPlan(planId?: string) {
  return plans.find(plan => (plan.price.monthly.id === planId || plan.price.yearly.id === planId));
}

export function getPlanByLabel(label: PlanLabel) {
  return plans.find(plan => plan.label === label);
}

export function getPlanIndex(planId?: string) {
  return plans.findIndex(plan => (plan.price.monthly.id === planId || plan.price.yearly.id === planId));
}
