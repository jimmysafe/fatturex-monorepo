"use client";

import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import type { getFattureCliente } from "@repo/database/queries/fatture";

import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { FatturaCard } from "@/components/modules/fatture/fattura-card";

import { FattureEmptyState } from "../fatture/fatture-empty-state";

export default function ClienteFatture() {
  const { id } = useParams<{ id: string }>();

  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["fatture", "cliente", id],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
      }).toString();
      const res = await fetch(`/api/clienti/${id}/fatture?${searchParams}`);
      return res.json() as Promise<Awaited<ReturnType<typeof getFattureCliente>>>;
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
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Fatture</h2>
      <section className="flex flex-col gap-4">
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
          : (
              <>
                {data?.pages.map(page => (
                  <Fragment key={page.meta.currentPage}>
                    {page.data.length === 0
                      ? (
                          <FattureEmptyState clienteId={id} />
                        )
                      : page.data.map(fattura => (
                          <FatturaCard key={fattura.id} {...fattura} />
                        ))}
                    {page.meta.hasNextPage && (data?.pageParams.length === page.meta.currentPage) && (
                      <div ref={ref}>
                        <Skeleton className="h-[82px] w-full" />
                      </div>
                    )}
                  </Fragment>
                ))}
              </>
            )}
      </section>
    </div>
  );
}
