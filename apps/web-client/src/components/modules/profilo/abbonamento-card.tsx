import { Suspense } from "react";

import { SubscriptionStato } from "@repo/database/lib/enums";
import { getPlan } from "@repo/shared/plans";
import { price } from "@repo/shared/price";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, CreditCard, ExternalLink, Link, Package, Rocket } from "lucide-react";

import { OpenCustomerPortalButton } from "@/components/common/open-customer-portal-button";
import { _getPartitaIva } from "@/lib/cached/get-partita-iva";
import { _getUserSubscription } from "@/lib/cached/get-subscription";

import { UpgradeModal } from "../abbonamento/upgrade-modal";
import { FteConfigurationModal } from "../partita-iva/fte-configuration-modal";
import { FteSuccessConfiguration } from "./fte-success-configuration";

export function AbbonamentoCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[374px]" />}>
      <Content />
    </Suspense>
  );
}

export async function Content() {
  const subscription = await _getUserSubscription();
  const partitaIva = await _getPartitaIva();

  const plan = getPlan(subscription?.planId);
  const isMonthly = plan?.price.monthly.id === subscription?.planId;

  const invoicesLimit = subscription?.invoicesLimit === -1 ? "Illimitato" : subscription?.invoicesLimit || 0;
  const invoicesUsed = subscription?.invoicesCount || 0;
  const searchesLimit = subscription?.searchesLimit || 0;
  const searchesUsed = subscription?.searchesCount || 0;

  const isProPlan = getPlan(subscription?.planId)?.label === "Pro";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 size-4" />
            Il tuo Abbonamento
          </CardTitle>
          <CardDescription>Dettagli sul tuo piano di abbonamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Piano</p>
              <p className="text-xl font-bold">{subscription?.plan ? subscription.plan.toUpperCase() : "-"}</p>
            </div>
            <Badge variant={subscription?.stato !== SubscriptionStato.ATTIVO ? "destructive" : "success"}>
              {subscription?.stato}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">Prezzo</p>
            <p>
              {isMonthly ? price(plan?.price.monthly.amount) : price(plan?.price.yearly.amount)}
              {" "}
              /
              {isMonthly ? "mese" : "anno"}
            </p>
          </div>

          {subscription?.startDate && subscription?.endDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Periodo di fatturazione</p>
              <div className="flex items-center">
                <Calendar className="mr-2 size-4 text-muted-foreground" />
                <p>
                  {format(subscription?.startDate, "PPP", { locale: it })}
                  {" "}
                  -
                  {format(subscription?.endDate, "PPP", { locale: it })}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">Prossimo Rinnovo</p>
            <p>{subscription?.endDate ? format(subscription.endDate, "PPP", { locale: it }) : "-"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <OpenCustomerPortalButton className="w-full" size="default">
            <ExternalLink className="mr-2 size-4" />
            Gestisci abbonamento
          </OpenCustomerPortalButton>
          {((subscription?.stato === SubscriptionStato.ATTIVO) && !isProPlan) && (
            <UpgradeModal trigger={(
              <Button className="w-full">
                <Rocket className="mr-2 size-4" />
                Effettua Upgrade
              </Button>
            )}
            />
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 size-4" />
            Utilizzo
          </CardTitle>
          <CardDescription>Monitora l'utilizzo delle tue risorse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Fatture</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {invoicesUsed}
                  {" "}
                  /
                  {invoicesLimit}
                </span>
              </div>
              <Progress value={typeof invoicesLimit === "number" ? (invoicesUsed / invoicesLimit) * 100 : 100} className="h-6 rounded-sm" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">Ricerca Azienda</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {searchesUsed}
                  {" "}
                  /
                  {searchesLimit}
                </span>
              </div>
              <Progress value={typeof searchesLimit === "number" ? (searchesUsed / searchesLimit) * 100 : 100} className="h-6 rounded-sm" />
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <p className="font-medium">Fattura Elettronica</p>
            {(subscription?.fteEnabled && partitaIva?.fteConfigurationId) ? (
              <Badge variant="success">Attiva</Badge>
            ) : (
              <Badge variant="destructive">Non Attiva</Badge>
            )}
          </div>
          <div className="flex-1 space-y-2">
            {/* ABILITATA MA NON CONFIGURATA */}
            {subscription?.fteEnabled && !partitaIva?.fteConfigurationId && (
              <div className="space-y-2">
                <FteConfigurationModal
                  trigger={(
                    <Button variant="outline" className="w-full bg-card">
                      <Link className="mr-2 size-4" />
                      Attiva Fattura Elettronica
                    </Button>
                  )}
                />
                <p className="text-[0.8rem] text-muted-foreground">Attiva la fatturazione elettronica per poter inviare le fatture in formato elettronico all&apos;Agenzia delle Entrate.</p>
              </div>
            )}

            {/* ABILITATA E CONFIGURATA */}
            {subscription?.fteEnabled && partitaIva?.fteConfigurationId && (
              <FteSuccessConfiguration partitaIva={partitaIva} />

            )}

            {/* DISABILITATA */}
            {!subscription?.fteEnabled && (
              <Alert variant="warn">
                <AlertTitle>Funzionalitá non disponibile.</AlertTitle>
                <AlertDescription>
                  La fatturazione elettronica é disponibile solo per i piani a pagamento.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
