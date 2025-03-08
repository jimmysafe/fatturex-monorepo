"use client";

import { Button } from "@repo/ui/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { ricalcoloContabilita } from "@/server/actions/contabilita";

export function ContabilitaRicalcoloButton(props: { anno: number }) {
  const { execute, isPending } = useServerAction(ricalcoloContabilita, {
    onSuccess() {
      toast.success("Ricalcolo completato");
    },
    onError({ err }) {
      toast.error(err.message);
    },
  });

  return (
    <Button size="sm" variant="ghost" className="text-primary" onClick={() => execute({ anno: props.anno.toString() })} loading={isPending}>
      <RotateCcw />
      Ricalcola
    </Button>
  );
}
