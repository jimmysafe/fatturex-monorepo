import { Suspense } from "react";

import { SubscriptionStato } from "@repo/database/lib/enums";
import { getPlanByLabel } from "@repo/shared/plans";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { Progress } from "@repo/ui/components/ui/progress";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TextRow } from "@repo/ui/components/ui/text-row";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";

import { OpenCustomerPortalButton } from "@/components/common/open-customer-portal-button";
import { _getUserSubscription } from "@/lib/cached/get-subscription";

import { UpgradeModal } from "../abbonamento/upgrade-modal";

export function AbbonamentoCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[374px]" />}>
      <Content />
    </Suspense>
  );
}

export async function Content() {
  const subscription = await _getUserSubscription();

  const invoicesLimit = subscription?.invoicesLimit === -1 ? "Illimitato" : subscription?.invoicesLimit || 0;
  const invoicesUsed = subscription?.invoicesCount || 0;
  const searchesLimit = subscription?.searchesLimit || 0;
  const searchesUsed = subscription?.searchesCount || 0;

  const isProPlan = getPlanByLabel("Pro");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle>Abbonamento</CardTitle>
        <CardDescription className="text-primary-foreground">Informazioni sul tuo piano di abbonamento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-6">
        <TextRow label="Piano" value={subscription?.plan ? subscription.plan.toUpperCase() : "-"} />
        <TextRow label="Stato" value={subscription?.stato} className={cn({ "text-destructive": subscription?.stato !== SubscriptionStato.ATTIVO })} />
        <TextRow label="Si rinnova il" value={subscription?.endDate ? format(subscription.endDate, "dd/MM/yyyy") : "-"} />
        <section className="space-y-4 pt-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Label>Limite Fatture</Label>
              <Label>
                {invoicesUsed}
                {" "}
                /
                {" "}
                {invoicesLimit}
              </Label>
            </div>
            <Progress value={typeof invoicesLimit === "number" ? (invoicesUsed / invoicesLimit) * 100 : 100} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Label>Limite Ricerca Azienda</Label>
              <Label>
                {searchesUsed}
                {" "}
                /
                {" "}
                {searchesLimit}
              </Label>
            </div>
            <Progress value={typeof searchesLimit === "number" ? (searchesUsed / searchesLimit) * 100 : 100} />
          </div>
        </section>
      </CardContent>
      <CardFooter className="flex gap-2">
        <OpenCustomerPortalButton variant="ghost" className="w-full">
          Gestisci abbonamento
        </OpenCustomerPortalButton>
        {((subscription?.stato === SubscriptionStato.ATTIVO) && !isProPlan) && (
          <UpgradeModal />
        )}
      </CardFooter>
    </Card>
  );
}
