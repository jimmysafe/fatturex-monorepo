"use client";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import type { getClienti } from "@repo/database/queries/clienti";

import { SearchInput } from "@repo/ui/components/ui/search-input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";

import { ClienteCard } from "@/components/modules/clienti/cliente-card";
import { ClienteCreateModal } from "@/components/modules/clienti/cliente-create-modal";
import { CientiEmptyState } from "@/components/modules/clienti/clienti-empty-state";

export default function ClientiPage() {
  const [search, setSearch] = useState<string>("");

  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["clienti", "infinite", search],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        search,
        page: pageParam.toString(),
      }).toString();
      const res = await fetch(`/api/clienti?${searchParams}`);
      return res.json() as Promise<Awaited<ReturnType<typeof getClienti>>>;
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

  useEffect(() => {
    if (search) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-bold">Clienti</h1>
        <ClienteCreateModal />
      </div>

      <div className="lg:max-w-sm">
        <SearchInput onSearch={setSearch} className="min-w-[300px] bg-card" />
      </div>

      <ul data-testid="clienti-list" className="flex flex-col gap-4">
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
              {page.data.map(cliente => (
                <li key={cliente.id} data-testid="cliente-list-item">
                  <ClienteCard {...cliente} />
                </li>
              ))}
              {page.meta.hasNextPage && (data?.pageParams.length === page.meta.currentPage) && (
                <li ref={ref}>
                  <Skeleton className="h-[82px] w-full" />
                </li>
              )}
            </Fragment>
          ))}
      </ul>

      {(data?.pages.length === 0 || data?.pages[0].data.length === 0) && <CientiEmptyState /> }

    </div>
  );
}
