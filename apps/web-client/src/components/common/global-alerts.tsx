import { SubscriptionStato } from "@repo/database/lib/enums";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";

import { _getUserSubscription } from "@/lib/cached/get-subscription";

import { OpenCustomerPortalButton } from "./open-customer-portal-button";

export async function GlobalAlerts() {
  const subscription = await _getUserSubscription();

  return (
    <>
      {subscription?.stato === SubscriptionStato.PAGAMENTO_RICHIESTO && (
        <Alert variant="destructive" className="mx-auto mt-6 max-w-4xl">
          <AlertTitle>Pagamento non riuscito</AlertTitle>
          <AlertDescription>{`Non è stato possibile processare il pagamento del tuo abbonamento a causa di un problema con la carta.\nPer continuare a utilizzare i servizi del tuo piano ${subscription.plan}, aggiorna il metodo di pagamento.`}</AlertDescription>
          <div className="flex justify-start pt-4">
            <OpenCustomerPortalButton>
              Gestisci abbonamento
            </OpenCustomerPortalButton>
          </div>
        </Alert>
      )}
    </>
  );
}
