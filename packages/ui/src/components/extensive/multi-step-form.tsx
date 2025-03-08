"use client";
import React, { useMemo } from "react";
import { useForm, useFormContext } from "react-hook-form";

import type { Stepper, Step as StepperStep } from "@stepperize/react";
import type { z, ZodSchema } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { defineStepper } from "@stepperize/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useMediaQuery } from "@/lib/hooks/use-media-query";

import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";

export type Step = StepperStep & {
  label: string;
  schema: ZodSchema;
  component: React.ReactNode;
  descrizione?: string;
};

const desktop = "(min-width: 768px)";

export function MultiStepForm<T extends Step, B>({ steps, defaultValues, onSubmit, onSubmitLoading, variant = "line" }: {
  variant: "default" | "squares-list" | "line";
  steps: T[];
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: B) => Promise<any>;
  onSubmitLoading: boolean;
}) {
  const isDesktop = useMediaQuery(desktop);
  const S = useMemo(() => {
    const config = steps.map(s => ({ id: s.id, label: s.label, schema: s.schema }));
    return defineStepper(...config);
  }, [steps]);

  const stepper = S.useStepper();

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
    resolver: zodResolver(stepper.current.schema),
    defaultValues,
  });

  const stepperComponents = useMemo(() => {
    return steps.reduce((acc, { id, component }) => ({
      ...acc,
      [id]: () => component,
    }), {} as Record<string, () => React.ReactNode>);
  }, [steps]);

  const currentIndex = S.utils.getIndex(stepper.current.id);

  const _onSubmit = async () => {
    if (stepper.isLast) {
      await onSubmit(form.getValues() as z.infer<typeof stepper.current.schema>);
    }
    else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(_onSubmit)}>
        <nav className="group my-4">
          {!isDesktop ? (
            <LineStepIndicator
              currentStepIndex={currentIndex}
              steps={steps}
            />
          )
            : (
                <CircleStepIndicator
                  currentStepIndex={currentIndex}
                  steps={steps}
                />
              )}
        </nav>
        <div className="space-y-4">
          <div className="px-0 py-6">
            {stepper.switch(stepperComponents)}
          </div>
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={stepper.prev}
              disabled={stepper.isFirst}
            >
              <ArrowLeft />
              Indietro
            </Button>
            <Button data-testid="next-button" loading={onSubmitLoading}>
              {stepper.isLast ? "Conferma" : "Prossimo"}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

interface StepIndicatorProps {
  currentStepIndex: number;
  stepper?: Stepper<Step[]>;
  steps: Step[];
  size?: number;
  strokeWidth?: number;
}

function LineStepIndicator({
  currentStepIndex,
  steps,
}: StepIndicatorProps) {
  const fillPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      <Progress value={fillPercentage} className="h-2" />
      <section className="flex items-start justify-between">
        <div className="space-y-2">
          <h5 data-testid={`${steps[currentStepIndex].id}-title`} className="text-sm font-bold">{steps[currentStepIndex]?.label}</h5>
          { steps[currentStepIndex]?.descrizione && <p className="max-w-lg text-sm text-muted-foreground">{steps[currentStepIndex]?.descrizione}</p> }
        </div>
        {/* <div className="aspect-square bg-muted flex items-center p-2 rounded-md">
          <span className="text-sm font-medium text-primary" aria-live="polite">
            {currentStepIndex+1} di {steps.length}
          </span>
        </div> */}
      </section>
    </div>
  );
}

function CircleStepIndicator({
  currentStepIndex,
  steps,
  size = 80,
  strokeWidth = 6,
}: StepIndicatorProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  const dashOffset = circumference - (circumference * fillPercentage) / 100;

  return (
    <section className="flex items-start justify-between">
      <div className="space-y-2">
        <h5 data-testid={`${steps[currentStepIndex].id}-title`} className="text-sm font-bold">{steps[currentStepIndex]?.label}</h5>
        { steps[currentStepIndex]?.descrizione && <p className="max-w-lg whitespace-pre-line text-sm text-muted-foreground">{steps[currentStepIndex]?.descrizione}</p> }
      </div>
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size}>
          <title>Step Indicator</title>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted-foreground/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="text-primary transition-all duration-300 ease-in-out"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium" aria-live="polite">
            {currentStepIndex + 1}
            {" "}
            di
            {" "}
            {steps.length}
          </span>
        </div>
      </div>
    </section>
  );
}

function SquareListStepIndicator({
  currentStepIndex,
  stepper,
  steps,
}: StepIndicatorProps) {
  const form = useFormContext();

  return (
    <ol
      className="flex items-center justify-between gap-2"
      aria-orientation="horizontal"
    >
      {steps.map((step, index, array) => (
        <React.Fragment key={step.id}>
          <li className="flex shrink-0 items-center gap-4">
            <Button
              type="button"
              role="tab"
              variant={index <= currentStepIndex ? "default" : "secondary"}
              aria-current={
                stepper?.current.id === step.id ? "step" : undefined
              }
              aria-posinset={index + 1}
              aria-setsize={steps.length}
              aria-selected={stepper?.current.id === step.id}
              className="flex size-10 items-center justify-center rounded-md"
              onClick={async () => {
                const valid = await form.trigger();
                // must be validated
                if (!valid)
                  return;
                // can't skip steps forwards but can go back anywhere if validated
                if (index - currentStepIndex > 1)
                  return;
                stepper?.goTo(step.id);
              }}
            >
              {index + 1}
            </Button>
            <span className="text-sm font-medium">{step.label}</span>
          </li>
          {index < array.length - 1 && (
            <Separator
              className={`flex-1 ${
                index < currentStepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </ol>
  );
}
