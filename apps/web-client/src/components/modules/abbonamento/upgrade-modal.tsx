"use client";
import { useState } from "react";

import type { getUserSubscription } from "@repo/database/queries/subscription";
import type {
  RootCredenzaDialogProps,
} from "@repo/ui/components/ui/credenza-dialog";

import { plans } from "@repo/shared/plans";
import { price } from "@repo/shared/price";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  CredenzaDialog,
  CredenzaDialogBody,
  CredenzaDialogContent,
  CredenzaDialogDescription,
  CredenzaDialogHeader,
  CredenzaDialogTitle,
  CredenzaDialogTrigger,
} from "@repo/ui/components/ui/credenza-dialog";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { createCustomerPortalSession } from "@/server/actions/subscriptions";

export function UpgradeModal({ trigger, ...props }: Omit<RootCredenzaDialogProps, "children"> & { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(props.open || false);
  const { data, isLoading } = useQuery<Awaited<ReturnType<typeof getUserSubscription>>>({
    queryKey: ["subscription"],
    queryFn: () => fetch("/api/subscription").then(res => res.json()),
    enabled: !!isOpen,
  });

  async function handleOpenCustomerPortal(priceId: string) {
    const [session] = await createCustomerPortalSession({ type: "subscription_update_confirm", priceId });
    if (!session?.url)
      return toast.error("Errore apertura portale");
    window.open(session.url, "_blank");
  }

  const currentPlanIndex = plans.findIndex(p => p.priceId === data?.planId);
  const upgradePlans = plans.filter((_, index) => index > currentPlanIndex);

  return (
    <CredenzaDialog open={isOpen} onOpenChange={setIsOpen} {...props}>
      <CredenzaDialogTrigger asChild>{trigger || <Button className="w-full bg-green-500" size="sm">Effettua Upgrade</Button>}</CredenzaDialogTrigger>
      <CredenzaDialogContent className="w-full max-w-4xl">
        <CredenzaDialogHeader>
          <CredenzaDialogTitle>Upgrade</CredenzaDialogTitle>
          <CredenzaDialogDescription>Effettua l&apos;upgrade del tuo piano di abbonamento.</CredenzaDialogDescription>
        </CredenzaDialogHeader>
        <CredenzaDialogBody>
          <div className="flex w-full flex-col items-stretch gap-2 md:flex-row">
            {isLoading
              ? (
                  <>
                    <Skeleton className="h-[461px] w-full" />
                    <Skeleton className="h-[461px] w-full" />
                  </>
                )
              : upgradePlans.map(plan => (
                  <Card key={plan.label} className="flex w-full flex-col rounded-lg border p-6 text-left">
                    <Badge className="mb-8 block w-fit">{ plan.label.toUpperCase()}</Badge>
                    <span className="text-4xl font-medium">{ price(plan.price.monthly)}</span>
                    <p className="text-sm text-muted-foreground">al mese</p>
                    <Separator className="my-6" />
                    <div className="flex flex-1 flex-col justify-between gap-20">
                      <ul className="flex-1 space-y-2 text-muted-foreground">
                        {plan.features.map(feature => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="size-4" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button onClick={() => handleOpenCustomerPortal(plan.priceId)} className="w-full">{plan.actionLabel}</Button>
                    </div>
                  </Card>
                ))}
          </div>
        </CredenzaDialogBody>
      </CredenzaDialogContent>
    </CredenzaDialog>
  );
}
