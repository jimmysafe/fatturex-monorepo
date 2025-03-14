import type { getFattura } from "@repo/database/queries/fatture";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";

export async function FatturaFteErrorAlert(fattura: Awaited<ReturnType<typeof getFattura>>) {
  if (!fattura || !fattura.fteError)
    return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>Errore di Scarto</AlertTitle>
      <AlertDescription>
        { fattura.fteError.split("|").map((e, i) => <p key={i}>{e.trim()}</p>) }
      </AlertDescription>
    </Alert>
  );
}
