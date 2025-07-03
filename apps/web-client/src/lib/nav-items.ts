import type { LucideIcon } from "lucide-react";

import { FileIcon, LayoutDashboardIcon, NewspaperIcon, SquareUserRoundIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Fatture",
    url: "/fatture",
    icon: NewspaperIcon,
  },
  {
    title: "Clienti",
    url: "/clienti",
    icon: SquareUserRoundIcon,
  },
  {
    title: "Documenti",
    url: "/documenti",
    icon: FileIcon,
  },
];
