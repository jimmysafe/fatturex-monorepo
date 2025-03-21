"use client";

import { useState } from "react";

import { authClient } from "@repo/auth/client";
import { getPlan, plans } from "@repo/shared/plans";
import { price } from "@repo/shared/price";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Separator } from "@repo/ui/components/ui/separator";
import { loadStripe } from "@stripe/stripe-js";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { env } from "@/env";
import { createCheckoutSession } from "@/server/actions/subscriptions";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function Pricing() {
  const router = useRouter();
  const [isAnnually, setIsAnnually] = useState(false);

  const { refetch } = authClient.useSession();
  const { execute, isPending } = useServerAction(createCheckoutSession, {
    onSuccess: async ({ data: session }) => {
      if (!session)
        return toast.error("Errore nella creazione della sessione di pagamento.");

      refetch();

      if (session.id) {
        const stripe = await stripePromise;
        const res = await stripe?.redirectToCheckout({ sessionId: session.id });
        if (res?.error) {
          console.error(res.error);
          toast.error("Errore nella creazione della sessione di pagamento.");
        }
      }
      else {
        router.push("/");
      }
    },
    onError: ({ err }) => toast.error(err.message),
  });

  async function onSubscribe(priceId: string) {
    const plan = getPlan(priceId);
    if (!plan)
      return toast.error("Piano non trovato");
    return execute({ priceId });
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-pretty text-2xl font-bold">
          Piani di abbonamento
        </h2>
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <p className="max-w-lg text-muted-foreground">
            Scegli il piano piú adatto alle tue esigenze.
          </p>
          <div className="flex h-11 w-fit shrink-0 items-center rounded-md bg-muted p-1 text-lg">
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
        </div>
      </div>
      <div className="flex w-full flex-col items-stretch gap-2 md:flex-row">
        {plans.map(plan => (
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
              <Button loading={isPending} onClick={() => onSubscribe(isAnnually ? plan.price.yearly.id : plan.price.monthly.id)} className="w-full">{plan.actionLabel}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
