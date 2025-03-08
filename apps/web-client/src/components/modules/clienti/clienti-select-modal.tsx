"use client";

import type { ReactNode } from "react";
import { Fragment, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useInView } from "react-intersection-observer";

import type { getClienti } from "@repo/database/queries/clienti";

import { nominativoCliente } from "@repo/shared/nominativo-cliente";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { SearchInput } from "@repo/ui/components/ui/search-input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

import { formatAddress } from "@/lib/address";

import { CientiEmptyState } from "./clienti-empty-state";

export function ClientiSelectModal(props: {
  trigger?: ReactNode;
  onConfirm?: (data: any) => any;
  defaultSelected?: string;
}) {
  const form = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string>(props.defaultSelected || "");

  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["clienti", "infinite", search],
    initialPageParam: 1,
    enabled: isOpen,
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
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Clienti"
      confirmText="Seleziona"
      description="Seleziona Cliente"
      trigger={props.trigger || (
        <Button size="sm">Seleziona Cliente</Button>
      )}
      confirmDisabled={!selected}
      onConfirm={async () => {
        form.setValue("clienteId", selected);
        setIsOpen(false);
      }}
    >
      <div className="space-y-6">
        <SearchInput onSearch={setSearch} className="min-w-[300px] bg-card" />
        <ul className="flex flex-col gap-2" data-testid="clienti-list">
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
                {page.data.map((cliente) => {
                  const isSelected = cliente.id === selected;
                  return (
                    <button
                      key={cliente.id}
                      data-testid="cliente-list-item"
                      type="button"
                      onClick={() => setSelected(cliente.id)}
                      className={cn("w-full text-sm font-semibold bg-card leading-none tracking-tight text-left p-4 border dark:border-muted border-gray-100 rounded-md flex items-start gap-4")}
                    >
                      <div className={cn("size-4 rounded-full border border-gray-100 dark:border-muted duration-200", { "border-primary bg-primary": isSelected })} />
                      <div>
                        <p className="text-primary">{nominativoCliente(cliente)}</p>
                        <div className="py-2 text-xs text-muted-foreground">
                          <p>
                            P.IVA
                            {" "}
                            {cliente.partitaIva || "-"}
                          </p>
                          <p>
                            CF
                            {" "}
                            {cliente.codiceFiscale || "-"}
                          </p>
                        </div>
                        <p className="text-xs">
                          {formatAddress(cliente)}
                        </p>
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
            ),
            )}
        </ul>
        {data?.pages.length === 0 || data?.pages[0].data.length === 0
          ? <CientiEmptyState className="border-none p-0" />
          : <></>}
      </div>
    </Modal>
  );
}
