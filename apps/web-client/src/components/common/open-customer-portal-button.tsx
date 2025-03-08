"use client";

import { useTransition } from "react";

import type { ButtonProps } from "@repo/ui/components/ui/button";

import { Button } from "@repo/ui/components/ui/button";

import { handleOpenCustomerPortal } from "@/lib/open-customer-portal";

export function OpenCustomerPortalButton(props: Omit<ButtonProps, "onClick">) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      loading={isPending}
      size="sm"
      variant="outline"
      onClick={() => {
        startTransition(async () => {
          await handleOpenCustomerPortal();
        });
      }}
      className="bg-card"
      {...props}
    />
  );
}
