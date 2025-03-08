import { province } from "@repo/shared/province";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { FormFields } from "@repo/ui/components/ui/form-fields";

import { OnboardingSchema } from "./schema";

export const OnboardingIndirizzoSchema = OnboardingSchema.pick({
  indirizzo: true,
  citta: true,
  cap: true,
  comune: true,
  provincia: true,
});

export function Indirizzo() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <FormFields.Input name="indirizzo" label="Indirizzo" />
        <FormFields.Input name="citta" label="Città" />
        <FormFields.Input name="cap" label="CAP" />
        <FormFields.Input name="comune" label="Comune" />
        <FormFields.Select name="provincia" label="Provincia" options={province} />
      </CardContent>
    </Card>
  );
}
