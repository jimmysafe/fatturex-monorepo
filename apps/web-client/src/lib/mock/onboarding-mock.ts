import type { z } from "zod";

import { faker } from "@faker-js/faker";
import { UserCassa } from "@repo/database/lib/enums";

import type { OnboardingSchema } from "@/components/modules/auth/onboarding-steps/schema";

export const mockOnboardingValues = {
  cap: "00166",
  codiceFiscale: "CSFGSR92R01H501F",
  cassa: UserCassa.GESTIONE_SEPARATA,
  citta: "Roma",
  codiceAteco: "01.12.00",
  comune: "Roma",
  provincia: "RM",
  cognome: "Cesare",
  partitaIva: faker.string.numeric(11),
  indirizzo: "Via Prospero Santacroce 22",
  nome: "Giulio",
  // @ts-expect-error not typed
  dataApertura: new Date(2024, 1, 1).toISOString(),
  dataDiNascita: new Date(1992, 1, 1),
} satisfies z.infer<typeof OnboardingSchema>;
