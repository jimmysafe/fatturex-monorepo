import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { FormFields } from "@repo/ui/components/ui/form-fields";

// export const OnboardingIbanSchema = OnboardingSchema.pick({ ibanIntestatario: true, iban: true, ibanBanca: true });

export function Iban() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Dettagli Fattura
        </CardTitle>
        <CardDescription>
          Fornisci i dettagli IBAN da riportare nella fattura, in questo modo ti sarà più facile richiedere il pagamento ai tuoi clienti.
          Ti ricordiamo che il dato è obbligatorio solo per l&apos;invio della fattura elettronica (SdI).
          Potrai fornire questo dato in un secondo momento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormFields.Input name="ibanIntestatario" label="Intestatario IBAN" />
        <FormFields.Input name="iban" label="IBAN" />
        <FormFields.Input name="ibanBanca" label="Nome Banca" />
      </CardContent>
    </Card>
  );
}
