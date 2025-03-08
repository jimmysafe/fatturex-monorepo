"use client";

import type { ButtonProps } from "@repo/ui/components/ui/button";

import { Button } from "@repo/ui/components/ui/button";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import { fteDeactivate } from "@/server/actions/fattura-elettronica";

export function FteDeactivateButton(props: Omit<ButtonProps, "onClick">) {
  const { execute, isPending } = useServerAction(fteDeactivate, {
    onSuccess() {
      toast.success("Fatturazione Elettronica disattivata.");
    },
  });

  return (
    <Button className="w-full" loading={isPending} variant="outline" onClick={() => execute()} {...props} />
  );
}
