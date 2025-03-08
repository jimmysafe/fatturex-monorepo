"use client";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function FattureEmptyState(props: { clienteId?: string; className?: string }) {
  const { anno } = useParams<{ anno: string }>();
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-6 py-20 border-2 border-dashed rounded-lg", props.className)}>
      <p className="text-sm text-muted-foreground">Non ci sono fatture da mostrare.</p>
      <Link href={props.clienteId ? `/${anno}/fatture/nuova?cid=${props.clienteId}` : `/${anno}/fatture/nuova`}>
        <Button size="sm" variant="ghost" className="text-primary">
          <PlusIcon className="size-8" />
          Nuova Fattura
        </Button>
      </Link>
    </div>
  );
}
