"use client";
import { useState } from "react";

import type { getAnniContabilita } from "@repo/database/queries/contabilita";

import { ThemeToggle } from "@repo/ui/components/extensive/theme-toggle";
import { Button } from "@repo/ui/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "@repo/ui/components/ui/sheet";
import { cn } from "@repo/ui/lib/utils";
import { CircleIcon, CogIcon, LogOutIcon, MenuIcon, UserIcon } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";

import type { MenuItem } from "@/lib/nav-items";

import { items } from "@/lib/nav-items";

import { Logo } from "../logo";
import { LogoutButton } from "../logout-button";
import { AnnoSwitcher } from "../navigation/anno-select";

export const mobileItems: MenuItem[] = [
  ...items,
  {
    title: "Profilo",
    url: "/profilo",
    icon: UserIcon,
  },
  {
    title: "Impostazioni",
    url: "/impostazioni",
    icon: CogIcon,
  },
];

export function NavigationPanel(
  props: { anni: Awaited<ReturnType<typeof getAnniContabilita>> },

) {
  const [isOpen, setIsOpen] = useState(false);
  const { anno } = useParams<{ anno: string }>();
  const pathName = usePathname();
  const router = useRouter();

  const path = pathName.split(`/${anno}`)[1] ? pathName.split(`/${anno}`)[1] : "/";
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon"><MenuIcon /></Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col" side="left">
        <SheetHeader className="flex flex-row items-center justify-between">
          <Logo />
          <AnnoSwitcher anni={props.anni} />
        </SheetHeader>
        <section className="flex flex-1 flex-col items-start gap-4 pt-16">
          {mobileItems.map((item) => {
            const isActive = path === item.url;
            const Icon = item.icon || CircleIcon;
            return (
              <Button
                onClick={() => {
                  router.push(`/${anno}${item.url}`);
                  setIsOpen(false);
                }}
                key={item.url}
                variant="ghost"
                size="sm"
                className={cn("hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm flex items-center", { "bg-muted": isActive })}
              >
                <Icon className="mr-1 text-muted-foreground" />
                <span className="font-medium">{item.title}</span>
              </Button>
            );
          })}
          <LogoutButton as={Button} variant="ghost" className="mt-20">
            <LogOutIcon className="text-muted-foreground" />
            Esci
          </LogoutButton>
        </section>
        <SheetFooter className="flex flex-row justify-end">
          <ThemeToggle />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
