"use client";

import { Suspense, use } from "react";

import type { getRicavoAnnuale } from "@repo/database/queries/contabilita";
import type { ChartConfig } from "@repo/ui/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Bar, BarChart, CartesianGrid, ChartContainer, ChartTooltip, ChartTooltipContent, XAxis } from "@repo/ui/components/ui/chart";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useParams } from "next/navigation";

const chartConfig = {
  ricavo: {
    label: "ricavo",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ContabilitaChart(props: { promise: ReturnType<typeof getRicavoAnnuale> }) {
  return (
    <Suspense fallback={<Skeleton className="h-[402px] w-full" />}>
      <Content {...props} />
    </Suspense>
  );
}

function Content(props: { promise: ReturnType<typeof getRicavoAnnuale> }) {
  const { anno } = useParams<{ anno: string }>();
  const data = use(props.promise);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Fatturato
          {" "}
          {anno}
        </CardTitle>
        <CardDescription>
          Gennaio - Dicembre
          {" "}
          {anno}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="mese"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="ricavo" fill="var(--color-ricavo)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
