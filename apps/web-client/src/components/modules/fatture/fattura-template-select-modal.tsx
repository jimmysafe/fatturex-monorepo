"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import type { getTemplates } from "@repo/database/queries/templates";
import type { Template } from "@repo/database/schema";

import { price } from "@repo/shared/price";
import { Modal } from "@repo/ui/components/extensive/modal";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";

export function FatturaTemplateSelectModal(props: {
  trigger?: ReactNode;
  onConfirm?: (data: any) => any;
  defaultSelected?: Template;
}) {
  const form = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Template | null>(props.defaultSelected || null);

  const { data, isLoading } = useQuery<Awaited<ReturnType<typeof getTemplates>>>({
    queryKey: ["templates"],
    queryFn: () => fetch("/api/templates?per_page=100").then(res => res.json()),
  });

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Template"
      confirmText="Seleziona"
      description="Seleziona un template per questa fattura"
      trigger={props.trigger || (
        <Button variant="outline" className="w-full bg-card py-6">
          <SearchIcon />
          Scegli un Template
        </Button>
      )}
      confirmDisabled={!selected}
      onConfirm={async () => {
        if (!selected)
          return;
        form.setValue("articoli", selected.articoli || []);
        setIsOpen(false);
      }}
    >
      <div className="space-y-6">
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
                  {data?.data.map((template) => {
                    const isSelected = template.id === selected?.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelected(template)}
                        className={cn("w-full text-sm font-semibold bg-card leading-none tracking-tight text-left p-4 border dark:border-muted border-gray-100 rounded-md flex items-start gap-4")}
                      >
                        <div className={cn("size-4 aspect-square rounded-full border border-gray-100 dark:border-muted duration-200", { "border-primary bg-primary": isSelected })} />
                        <div>
                          <p className="text-primary">{template.name}</p>
                          <div className="mt-1 space-y-1 py-2 text-xs text-muted-foreground">
                            {template.articoli.map(articolo => (
                              <div key={articolo.id} className="flex gap-2">
                                <p className="line-clamp-1">{articolo.descrizione}</p>
                                <p>{price(articolo.prezzo)}</p>
                              </div>
                            )) }
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
        </section>
      </div>
    </Modal>
  );
}
