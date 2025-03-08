import { Suspense } from "react";

import { getFatture } from "@repo/database/queries/fatture";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { session } from "@/lib/session";

import { FatturaCard } from "./fattura-card";
import { FattureEmptyState } from "./fatture-empty-state";

export function FattureListLatest({ anno }: { anno: string }) {
  return (
    <Suspense fallback={<FattureListLatestSkeleton />}>
      <FattureListLatestContent anno={anno} />
    </Suspense>
  );
}

async function FattureListLatestContent({ anno }: { anno: string }) {
  const { user } = await session();
  const fatture = await getFatture({ per_page: "5", annoSaldo: anno, userId: user.id });

  return (
    <div className="flex flex-col gap-4">
      {fatture?.data.length === 0
        ? <FattureEmptyState />
        : fatture?.data.map(fattura => (
          <FatturaCard key={fattura.id} {...fattura} />
        ))}
    </div>
  );
}

function FattureListLatestSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[82px] w-full" />
      <Skeleton className="h-[82px] w-full" />
      <Skeleton className="h-[82px] w-full" />
      <Skeleton className="h-[82px] w-full" />
      <Skeleton className="h-[82px] w-full" />
    </div>
  );
}
