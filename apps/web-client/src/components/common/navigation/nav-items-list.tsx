"use client";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { items } from "@/lib/nav-items";

export function NavItemsList({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const { anno } = useParams<{ anno: string }>();
  const pathName = usePathname();

  const path = pathName.split(`/${anno}`)[1] ? pathName.split(`/${anno}`)[1] : "/";

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {items.map((item) => {
        const isActive = path === item.url;
        return (
          <Link href={`/${anno}${item.url}`} key={item.url} className="group">
            <Button variant="ghost" size="sm" className={cn("group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground h-8 text-sm flex items-center", { "bg-muted": isActive })}>
              <span className="font-medium">{item.title}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
