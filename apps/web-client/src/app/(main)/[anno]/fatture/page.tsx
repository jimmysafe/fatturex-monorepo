"use client";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import type { FatturaStatoType } from "@repo/database/lib/enums";
import type { getFatture } from "@repo/database/queries/fatture";

import { FatturaStato } from "@repo/database/lib/enums";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { FatturaCard } from "@/components/modules/fatture/fattura-card";
import { FattureEmptyState } from "@/components/modules/fatture/fatture-empty-state";
import { FattureExportModal } from "@/components/modules/fatture/fatture-export-modal";

export default function FatturePage() {
  const router = useRouter();
  const search = useSearchParams();
  const { anno } = useParams<{ anno: string }>();

  const stato = search.get("stato") as FatturaStatoType | undefined;

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["fatture", anno, stato || ""],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
      });

      if (!stato)
        // return { ...defaultParams, annoEmissione: anno };
        searchParams.append("annoEmissione", anno);
      if (stato === FatturaStato.SALDATA) {
        // return { ...defaultParams, annoSaldo: anno, stato: FatturaStato.SALDATA };
        searchParams.append("annoSaldo", anno);
        searchParams.append("stato", FatturaStato.SALDATA);
      }
      if (stato === FatturaStato.EMESSA) {
        // return { ...defaultParams, annoEmissione: anno, stato: FatturaStato.EMESSA };
        searchParams.append("annoEmissione", anno);
        searchParams.append("stato", FatturaStato.EMESSA);
      }
      if (stato === FatturaStato.ANNULLATA) {
        // return { ...defaultParams, annoEmissione: anno, stato: FatturaStato.ANNULLATA };
        searchParams.append("annoEmissione", anno);
        searchParams.append("stato", FatturaStato.ANNULLATA);
      }

      const res = await fetch(`/api/fatture?${searchParams}`);
      return res.json() as Promise<Awaited<ReturnType<typeof getFatture>>>;
    },
    getNextPageParam: (data) => {
      if (data.meta.hasNextPage)
        return data.meta.currentPage + 1;
      return null;
    },
    getPreviousPageParam: (data) => {
      if (data.meta.hasPreviousPage)
        return data.meta.currentPage - 1;
      return null;
    },
  });

  const { ref, inView } = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView && !isLoading) {
      fetchNextPage();
    }
  }, [inView, isLoading, fetchNextPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-bold">Fatture</h1>
        <div className="flex items-center">
          <FattureExportModal />
          <Link href={`/${anno}/fatture/nuova`}>
            <Button variant="ghost" className="text-primary" data-testid="new-fattura-button">
              <PlusIcon className="size-8" />
              <p>Nuova Fattura</p>
            </Button>

          </Link>
        </div>
      </div>
      <section className="flex justify-start">
        <Card className="flex items-center gap-1 bg-card p-2">
          <Button size="sm" variant={!stato ? "secondary" : "ghost"} onClick={() => router.push(`/${anno}/fatture`)}>
            Tutte
          </Button>
          <Button size="sm" variant={stato === FatturaStato.EMESSA ? "secondary" : "ghost"} onClick={() => router.push(`/${anno}/fatture/?stato=${FatturaStato.EMESSA}`)}>
            Emesse
          </Button>
          <Button size="sm" variant={stato === FatturaStato.SALDATA ? "secondary" : "ghost"} onClick={() => router.push(`/${anno}/fatture/?stato=${FatturaStato.SALDATA}`)}>
            Saldate
          </Button>
          <Button size="sm" variant={stato === FatturaStato.ANNULLATA ? "secondary" : "ghost"} onClick={() => router.push(`/${anno}/fatture/?stato=${FatturaStato.ANNULLATA}`)}>
            Annullate
          </Button>
        </Card>
      </section>
      <ul className="flex flex-col gap-4" data-testid="fatture-list">
        {isLoading
          ? (
              <>
                <Skeleton className="h-[82px] w-full" />
                <Skeleton className="h-[82px] w-full" />
                <Skeleton className="h-[82px] w-full" />
                <Skeleton className="h-[82px] w-full" />
                <Skeleton className="h-[82px] w-full" />
              </>
            )
          : data?.pages.map(page => (
            <Fragment key={page.meta.currentPage}>
              {page.data.map(fattura => (
                <li key={fattura.id} data-testid="fattura-list-item">
                  <FatturaCard {...fattura} />
                </li>
              ))}
              {page.meta.hasNextPage && (data?.pageParams.length === page.meta.currentPage) && (
                <div ref={ref}>
                  <Skeleton className="h-[82px] w-full" />
                </div>
              )}
            </Fragment>
          ))}
        {
          data?.pages.length === 0 || data?.pages[0].data.length === 0
            ? <FattureEmptyState /> : <></>

        }

      </ul>

    </div>
  );
}
