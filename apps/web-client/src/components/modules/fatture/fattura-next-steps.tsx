"use client";
import { Fragment, use, useMemo } from "react";

import type { getFattura } from "@repo/database/queries/fatture";
import type { getUserSubscription } from "@repo/database/queries/subscription";
import type {
  LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowRight,
  CheckCircleIcon,
  CircleIcon,
  DollarSignIcon,
  MailIcon,
  RocketIcon,
} from "lucide-react";

import { UpgradeModal } from "../abbonamento/upgrade-modal";
import { FatturaEmailModal } from "./fattura-email-modal";
import { FatturaFteInvioModal } from "./fattura-fte-invio-modal";
import { SaldaFatturaModal } from "./fattura-salda-modal";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  done: boolean;
}

export function FatturaNextSteps(
  { subscriptionPromise, fattura }: { fattura: Awaited<ReturnType<typeof getFattura>>; subscriptionPromise: ReturnType<typeof getUserSubscription> },
) {
  const subscription = use(subscriptionPromise);
  const steps = useMemo((): Step[] => {
    if (!fattura)
      return [];
    return [
      {
        id: "fte",
        label: "Firma e Invia ",
        description: "Firma e invia la fattura all'agenzia delle entrate. \n Questa operazione è obbligatoria per legge entro 12 giorni dalla data di emissione.",
        icon: RocketIcon,
        done: !!fattura.fteId,
      },
      {
        id: "email",
        label: "Invia Email",
        description: "Fatti notare! Invia la fattura al cliente tramite email.",
        icon: MailIcon,
        done: !!fattura.dataInvioEmail,
      },
      {
        id: "salda",
        label: "Salda",
        description: "Hai giá ricevuto il pagamento? Salda la fattura. \n Questa operazione inserirá l'importo della fattura nel sistema di calcolo della contabilitá.",
        icon: DollarSignIcon,
        done: !!fattura.dataSaldo,
      },
    ];
  }, [fattura]);

  if (!fattura)
    return null;

  if (fattura.fteId && fattura.dataInvioEmail && fattura.dataSaldo)
    return <></>;

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Consigli</CardTitle>
        <CardDescription>Segui questi passaggi essenziali per ottenere una fattura perfettamente in regola!</CardDescription>
      </CardHeader>
      <CardContent>
        {steps.map((step, index) => {
          const s = { ...step, isLast: index === steps.length - 1 };
          if (step.id === "fte") {
            if (subscription?.fteEnabled)
              return <FatturaFteInvioModal key={step.id} id={fattura.id} trigger={<button type="button" className="w-full" disabled={s.done}><StepComponent {...s} /></button>} />;
            return <UpgradeModal key={step.id} trigger={<button type="button" className="w-full" disabled={s.done}><StepComponent {...s} /></button>} />;
          }
          if (step.id === "salda")
            return <SaldaFatturaModal key={step.id} fattura={fattura} trigger={<button type="button" className="w-full" disabled={s.done}><StepComponent {...s} /></button>} />;
          if (step.id === "email")
            return <FatturaEmailModal key={step.id} fattura={fattura} trigger={<button type="button" className="w-full" disabled={s.done}><StepComponent {...s} /></button>} />;
          return <Fragment key={step.id} />;
        })}
      </CardContent>
    </Card>
  );
}

function StepComponent(step: Step & { isLast: boolean }) {
  const Icon = step.icon || CircleIcon;
  return (
    <div className={cn("rounded-lg border border-transparent flex w-full min-h-20 p-0", { "hover:bg-muted/50 hover:border-muted": !step.done })}>
      <section className="flex flex-col items-center gap-1">
        <div className={cn("bg-primary/20 p-2 rounded-full size-10 aspect-square flex items-center justify-center mt-1", { "bg-muted": step.done })}>
          <div className={cn("bg-card border border-primary rounded-full size-8 aspect-square flex items-center justify-center", { "border-muted": step.done })}>
            {step.done
              ? <CheckCircleIcon className="size-4 text-green-500" />
              : <Icon className="size-4 text-primary" />}
          </div>
        </div>
        <Separator orientation="vertical" className={cn("bg-primary h-auto flex-1 w-[2px]", { "bg-transparent": step.isLast })} />
      </section>
      <section className="flex flex-1 gap-4 px-4 py-2">
        <div className="flex-1 space-y-1 text-left">
          <h5 className={cn("font-semibold leading-none tracking-tight text-sm", { "text-muted-foreground": step.done })}>{step.label}</h5>
          <p className={cn("text-sm text-muted-foreground whitespace-pre-line", { "text-muted-foreground/30": step.done })}>{ step.description}</p>
        </div>
        <div className="flex items-start justify-center">
          {!step.done && (
            <ArrowRight className="size-5 text-primary" />
          ) }
        </div>
      </section>
    </div>
  );
}
