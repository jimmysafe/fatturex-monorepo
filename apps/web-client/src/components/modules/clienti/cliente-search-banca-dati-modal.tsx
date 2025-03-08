"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import type { getUserSubscription } from "@repo/database/queries/subscription";
import type { ClienteUpdateDto } from "@repo/database/schema";

import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCw, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import type { SearchCliente } from "@/server/actions/clienti-banca-dati/types";

import { getDettagliCliente, searchCliente } from "@/server/actions/clienti-banca-dati";

import { UpgradeModal } from "../abbonamento/upgrade-modal";

export function ClienteSearchBancaDatiModal(props: {
  trigger?: ReactNode;
  onConfirm?: (data: any) => any;
}) {
  const form = useFormContext<ClienteUpdateDto>();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<SearchCliente[] | null>(null);
  const [selected, setSelected] = useState<SearchCliente | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [showUpgradeModal, setShwUpgradeModal] = useState(false);

  const { execute: cercaCliente, isPending: cercaClienteLoading } = useServerAction(searchCliente, {
    onSuccess: ({ data }) => {
      setCount(data.count);
      setSearchResult(null);
    },
    onError: ({ err }) => {
      if (err.code === "PAYMENT_REQUIRED") {
        return setShwUpgradeModal(true);
      }
      toast.error(err.message);
    },
  });

  const { execute: dettagliCliente, isPending: dettagliClienteLoading } = useServerAction(getDettagliCliente, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setSearchResult(data.data || []);
    },
    onError: ({ err }) => {
      if (err.code === "PAYMENT_REQUIRED") {
        return setShwUpgradeModal(true);
      }
      toast.error(err.message);
    },
  });

  async function handleSearchConfirm() {
    return dettagliCliente({ search });
  }

  async function onConfirm() {
    if (!selected) {
      toast.error("Seleziona un cliente");
    }
    else {
      form.reset({
        codiceFiscale: selected.taxCode,
        partitaIva: selected.vatCode,
        ragioneSociale: selected.companyName,
        indirizzoPec: selected.pec,
        indirizzoEmail: selected.pec,
        indirizzo: selected.address.registeredOffice.streetName,
        cap: selected.address.registeredOffice.zipCode,
        provincia: selected.address.registeredOffice.province,
        comune: selected.address.registeredOffice.town || selected.address.registeredOffice.province,
      });

      setIsOpen(false);
    }
  }

  async function onSearch() {
    if (!search)
      return toast.error("Inserisci un valore di ricerca");
    await cercaCliente({ search });
  }

  return (
    <>
      {showUpgradeModal && <UpgradeModal trigger={<></>} open={showUpgradeModal} onOpenChange={setShwUpgradeModal} />}
      <Modal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Ricerca Aziende"
        description="Trova il tuo nuovo cliente nella banca dati aziende."
        onConfirm={onConfirm}
        trigger={props.trigger || (
          <Button type="button" className="w-full" variant="outline" size="sm">
            <SearchIcon className="size-4" />
            Ricerca Aziende
          </Button>
        )}
      >
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-1">
            <Input placeholder="Nome Azienda" onChange={e => setSearch(e.target.value)} value={search} />
            <Button disabled={cercaClienteLoading} size="icon" onClick={onSearch}>{cercaClienteLoading ? <RotateCw className="mr-1 aspect-square size-4 animate-spin" aria-hidden="true" /> : <SearchIcon />}</Button>
          </div>
          {typeof count === "number" && (
            <div className="space-y-1 text-sm text-muted-foreground">
              <span className="font-medium">
                {count}
                {" "}
                {count === 1 ? "risultato trovato" : "risultati trovati"}
              </span>

              {count > 0 && !searchResult && (
                <div className="space-y-2 pt-2">
                  <p>
                    Procedendo con la visualizzazione verrà decrementato il numero di ricerche mensili disponibili.
                  </p>
                  <Button loading={dettagliClienteLoading} className="w-full" size="sm" onClick={handleSearchConfirm}>Visualizza i Dati</Button>
                  <AvailableSearchesAlert />
                </div>
              )}

            </div>
          )}
          {searchResult && (
            <div className="space-y-2">
              {searchResult.map((company) => {
                const isSelected = company.id === selected?.id;
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelected(company)}
                    className={cn("w-full text-sm font-semibold bg-card leading-none tracking-tight text-left p-4 border dark:border-muted border-gray-100 rounded-md flex items-start gap-4")}
                  >
                    <div className={cn("size-4 aspect-square rounded-full border border-gray-100 dark:border-muted duration-200", { "border-primary bg-primary": isSelected })} />
                    <div>
                      <p className="text-primary">{company.companyName}</p>
                      <div className="py-2 text-xs text-muted-foreground">
                        <p>
                          P.IVA
                          {" "}
                          {company.vatCode || "-"}
                        </p>
                        <p>
                          CF
                          {" "}
                          {company.taxCode || "-"}
                        </p>
                      </div>
                      <p className="text-xs">
                        {company.address.registeredOffice.town}
                        {" "}
                        (
                        {company.address.registeredOffice.province}
                        ) -
                        {" "}
                        {company.address.registeredOffice.streetName || "-"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

      </Modal>
    </>
  );
}

function AvailableSearchesAlert() {
  const { data, isLoading } = useQuery<Awaited<ReturnType<typeof getUserSubscription>>>({
    queryKey: ["subscription"],
    queryFn: () => fetch("/api/subscription").then(res => res.json()),
  });

  if (isLoading)
    return <Skeleton className="h-[94px]" />;

  return (
    <div className="rounded-md border bg-muted/10 p-3 text-sm text-muted-foreground">
      <div className="mb-2 flex items-center justify-between">
        <span>Ricerche mensili disponibili:</span>
        <span className="font-medium">
          {(data?.searchesLimit || 0) - (data?.searchesCount || 0)}
          {" "}
          di
          {" "}
          {data?.searchesLimit}
        </span>
      </div>
      <p className="text-sm">
        Per aumentare il numero di ricerche disponibili,
        {" "}
        {" "}
        <UpgradeModal
          trigger={<Button variant="link" className="h-auto p-0 text-sm">effettua l'upgrade del piano</Button>}
        />
      </p>
    </div>
  );
}
