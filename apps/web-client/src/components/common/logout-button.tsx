"use client";
import type { ComponentProps, ElementType } from "react";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";

type LogoutButtonProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentProps<T>, "as" | "onClick">;

export function LogoutButton<T extends ElementType = typeof Button>({
  as,
  children,
  ...props
}: LogoutButtonProps<T>) {
  const router = useRouter();
  const Component = as || Button;
  const content = children || "Esci";

  return (
    <Component
      onClick={async () => {
        await authClient.signOut();
        router.push("/signin");
      }}
      {...props}
    >
      {content}
    </Component>
  );
}
