"use client";

import { authClient } from "@repo/auth/client";
import { plans } from "@repo/shared/plans";
import { price } from "@repo/shared/price";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
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
    const plan = plans.find(p => p.priceId === priceId)!;
    if (plan.price.monthly === 0)
      return router.push("/");
    return execute({ priceId: plan.priceId });
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-pretty text-2xl font-bold">
          Piani di abbonamento
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Scegli il piano piú adatto alle tue esigenze.
        </p>
      </div>
      <div className="flex w-full flex-col items-stretch gap-2 md:flex-row">
        {plans.map(plan => (
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
              <Button loading={isPending} onClick={() => onSubscribe(plan.priceId)} className="w-full">{plan.actionLabel}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
