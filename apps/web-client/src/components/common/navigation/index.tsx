import { Suspense } from "react";

import { ThemeToggle } from "@repo/ui/components/extensive/theme-toggle";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { _getAnniContabilita } from "@/lib/cached/get-anni-contabilita";
import { session } from "@/lib/session";

import { Logo } from "../logo";
import { AnnoSwitcher } from "./anno-select";
import { NavigationPanel } from "./mobile";
import { NavItemsList } from "./nav-items-list";
import { UserDropdown } from "./user-dropdown";

export function Navigation() {
  return (
    <Suspense fallback={<Skeleton className="h-[74px]" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const { user } = await session();
  const anni = await _getAnniContabilita();

  return (
    <nav className="flex justify-between rounded-lg border border-gray-100 bg-card p-4 shadow-fade dark:border-muted">
      <Logo iconOnly={false} />
      <div className="hidden gap-10 md:flex">
        <NavItemsList />
        <div className="flex items-center gap-2">
          <AnnoSwitcher anni={anni} />
          <ThemeToggle />
          <UserDropdown user={user} />
        </div>
      </div>
      <div className="block md:hidden">
        <NavigationPanel anni={anni} />
      </div>
    </nav>
  );
}
