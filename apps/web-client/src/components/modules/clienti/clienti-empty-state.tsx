"use client";
import { cn } from "@repo/ui/lib/utils";

import { ClienteCreateModal } from "./cliente-create-modal";

export function CientiEmptyState(props: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-20 border-2 border-dashed rounded-lg", props.className)}>
      <p className="text-sm text-muted-foreground">Non ci sono clienti da mostrare.</p>
      <ClienteCreateModal />
    </div>
  );
}
