"use client";

import { useState } from "react";

import { plans } from "@repo/shared/plans";
import { price } from "@repo/shared/price";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Separator } from "@repo/ui/components/ui/separator";
import { cn } from "@repo/ui/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

import { getAppUrl } from "@/lib/app-url";
import { container } from "@/lib/container";

export function Pricing() {
  const [isAnnually, setIsAnnually] = useState(false);
  return (
    <section id="pricing" className={cn("py-12 md:py-24 scroll-mt-20", container)}>
      <div className="container">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-6">
          <h2 className="text-pretty text-4xl font-bold lg:text-6xl">
            Piani di abbonamento
          </h2>
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <p className="max-w-screen-md text-muted-foreground lg:text-xl">
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
          <div className="flex w-full flex-col items-stretch gap-2 md:flex-row">
            {plans.map(plan => (
              <Card key={plan.label} className="flex w-full flex-col rounded-lg border p-6 text-left">
                <Badge className="mb-8 block w-fit">{ plan.label.toUpperCase()}</Badge>
                <span className="text-4xl font-medium">{ isAnnually ? price(plan.price.yearly.amount) : price(plan.price.monthly.amount)}</span>
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
                  <Link href={getAppUrl()}>
                    <Button className="w-full">{plan.actionLabel}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
