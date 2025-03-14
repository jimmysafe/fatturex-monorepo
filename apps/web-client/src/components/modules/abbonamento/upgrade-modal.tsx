"use client";
import { useState } from "react";

import type { getUserSubscription } from "@repo/database/queries/subscription";
import type {
  RootCredenzaDialogProps,
} from "@repo/ui/components/ui/credenza-dialog";

import { getPlanIndex, plans } from "@repo/shared/plans";
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
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { createCustomerPortalSession } from "@/server/actions/subscriptions";

export function UpgradeModal({ trigger, ...props }: Omit<RootCredenzaDialogProps, "children"> & { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(props.open || false);
  const [isAnnually, setIsAnnually] = useState(false);

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

  const currentPlanIndex = getPlanIndex(data?.planId);
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
          <div className="space-y-4">
            <div className="flex h-11 w-fit shrink-0 items-center rounded-md bg-muted p-1">
              <RadioGroup
                defaultValue="monthly"
                className="h-full grid-cols-2"
                onValueChange={(value) => {
                  setIsAnnually(value === "annually");
                }}
              >
                <div className='h-full rounded-md transition-all has-[button[data-state="checked"]]:bg-white'>
                  <RadioGroupItem
                    value="monthly"
                    id="monthly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="monthly"
                    className="flex h-full cursor-pointer items-center justify-center px-7 font-semibold text-muted-foreground peer-data-[state=checked]:text-primary"
                  >
                    Mensile
                  </Label>
                </div>
                <div className='h-full rounded-md transition-all has-[button[data-state="checked"]]:bg-white'>
                  <RadioGroupItem
                    value="annually"
                    id="annually"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="annually"
                    className="flex h-full cursor-pointer items-center justify-center gap-1 px-7 font-semibold text-muted-foreground peer-data-[state=checked]:text-primary"
                  >
                    Annuale
                  </Label>
                </div>
              </RadioGroup>
            </div>
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
                      <span className="text-4xl font-medium">{ isAnnually ? price(plan.price.yearly.amount) : price(plan.price.monthly.amount)}</span>
                      <p className="text-sm text-muted-foreground">{isAnnually ? "all'anno" : "al mese"}</p>
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
                        <Button onClick={() => handleOpenCustomerPortal(isAnnually ? plan.price.yearly.id : plan.price.monthly.id)} className="w-full">{plan.actionLabel}</Button>
                      </div>
                    </Card>
                  ))}
            </div>
          </div>
        </CredenzaDialogBody>
      </CredenzaDialogContent>
    </CredenzaDialog>
  );
}
