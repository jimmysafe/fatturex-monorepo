"use client";
import type { ReactNode } from "react";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import type { getCodiciAteco } from "@repo/database/queries/codice-ateco";

import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { SearchInput } from "@repo/ui/components/ui/search-input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

export function CodiceAtecoSelectModal(
  props: {
    onConfirm: (selected: string) => void;
    trigger?: ReactNode;
    defaultSelected?: string;
  },
) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(props.defaultSelected || null);

  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["codici-ateco", search],
    initialPageParam: 1,
    enabled: isOpen,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        search,
        page: pageParam.toString(),
      }).toString();
      const res = await fetch(`/api/codice-ateco?${searchParams}`);
      return res.json() as Promise<Awaited<ReturnType<typeof getCodiciAteco>>>;
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

  // const { data, fetchNextPage, isLoading, refetch } = useServerActionInfiniteQuery(getCodiciAteco, {
  //   queryKey: ["codici-ateco", "infinite", search],
  //   initialPageParam: 1,
  //   enabled: isOpen,
  //   getNextPageParam: (data) => {
  //     if (data.meta.hasNextPage)
  //       return data.meta.currentPage + 1;
  //     return null;
  //   },
  //   getPreviousPageParam: (data) => {
  //     if (data.meta.hasPreviousPage)
  //       return data.meta.currentPage - 1;
  //     return null;
  //   },
  //   input: (x) => {
  //     return { page: x.pageParam.toString(), search };
  //   },
  // });

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
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Seleziona Codice Ateco"
      description="Seleziona il codice Ateco che meglio descrive la tua attività."
      confirmText="Conferma"
      confirmDisabled={!selected}
      onConfirm={async () => {
        if (!selected)
          return;
        props.onConfirm(selected);
        setIsOpen(false);
      }}
      triggerLabel="Codice Ateco"
      trigger={props.trigger || (
        <Button variant="outline" className="!mt-2 w-full justify-start bg-card px-3">{props.defaultSelected || "Seleziona Codice Ateco"}</Button>
      )}
    >
      <div className="space-y-6">
        <SearchInput onSearch={setSearch} className="min-w-[300px] bg-card" />
        <section className="flex flex-col gap-2">
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
                      {page.data.map((ateco) => {
                        const isSelected = ateco.codice === selected;
                        return (
                          <button
                            key={ateco.codice}
                            type="button"
                            onClick={() => setSelected(ateco.codice)}
                            className={cn("w-full text-sm font-semibold bg-card leading-none tracking-tight text-left p-4 border dark:border-muted border-gray-100 rounded-md flex items-start gap-4")}
                          >
                            <div className={cn("size-4 rounded-full aspect-square border border-gray-100 dark:border-muted duration-200", { "border-primary bg-primary": isSelected })} />
                            <div>
                              <p className="text-primary">{ateco.codice}</p>
                              <div className="py-2 text-xs text-muted-foreground">
                                <p>{ateco.descrizione}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
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
    </Modal>
  );
}
