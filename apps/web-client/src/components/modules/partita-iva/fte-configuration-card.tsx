import { Suspense } from "react";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TextRow } from "@repo/ui/components/ui/text-row";

import { _getPartitaIva } from "@/lib/cached/get-partita-iva";
import { _getUserSubscription } from "@/lib/cached/get-subscription";

import { FteDeactivateButton } from "../abbonamento/fte-deactivate-button";
import { UpgradeModal } from "../abbonamento/upgrade-modal";
import { FteConfigurationModal } from "./fte-configuration-modal";

export function FteConfigurationCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[374px]" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const partitaIvaPromise = _getPartitaIva();
  const subscriptionPromise = _getUserSubscription();

  const [partitaIva, subscription] = await Promise.all([partitaIvaPromise, subscriptionPromise]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Fattura Elettronica
        </CardTitle>
        <CardDescription>Attiva e configura la fatturazione elettronica.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {subscription?.fteEnabled
          ? (
              <>
                {!partitaIva?.fteConfigurationId
                  ? (
                      <Alert variant="warn">
                        <AlertTitle>Fattura Elettronica non attiva.</AlertTitle>
                        <AlertDescription>
                          Attiva la fatturazione elettronica per poter inviare le fatture in formato elettronico all&apos;Agenzia delle Entrate.
                        </AlertDescription>
                      </Alert>
                    )
                  : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-muted-foreground">Stato:</p>
                          <Badge className="bg-green-500">Attiva</Badge>
                        </div>
                        <TextRow label="Identificativo" value={partitaIva?.fteConfigurationId} />
                      </>
                    )}
              </>
            )
          : (
              <Alert variant="warn">
                <AlertTitle>Funzionalitá non disponibile.</AlertTitle>
                <AlertDescription>
                  La fatturazione elettronica é disponibile solo per i piani a pagamento.
                </AlertDescription>
              </Alert>
            ) }
      </CardContent>
      <CardFooter>
        {subscription?.fteEnabled
          ? (
              <>
                {!partitaIva?.fteConfigurationId
                  ? (
                      <FteConfigurationModal />
                    )
                  : (
                      <FteDeactivateButton>Disattiva</FteDeactivateButton>
                    )}
              </>
            )
          : (
              <UpgradeModal />
            )}
      </CardFooter>
    </Card>
  );
}
