import { Card, CardContent } from "@repo/ui/components/ui/card";
import { FormFields } from "@repo/ui/components/ui/form-fields";

import { OnboardingSchema } from "./schema";

export const OnboardingGeneralInfoSchema = OnboardingSchema.pick({
  codiceFiscale: true,
  nome: true,
  cognome: true,
});

export function GeneralInfo() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <FormFields.Input name="nome" label="Nome" description="Il tuo nome" />
        <FormFields.Input name="cognome" label="Cognome" description="Il tuo cognome" />
        <FormFields.Input name="codiceFiscale" label="Codice Fiscale" normalize="uppercase" />
      </CardContent>
    </Card>
  );
}
