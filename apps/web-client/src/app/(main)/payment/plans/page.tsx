import { ThemeToggle } from "@repo/ui/components/extensive/theme-toggle";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import Image from "next/image";

import { Logo } from "@/components/common/logo";
import { LogoutButton } from "@/components/common/logout-button";
import { Pricing } from "@/components/common/pricing";
import { session } from "@/lib/session";

export default async function PricingPage() {
  const { user } = await session();

  return (
    <main className="container mx-auto max-w-5xl py-6">
      <nav className="flex justify-between p-4">
        <Logo />
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden">
                {user.image
                  ? <Image src={user.image} alt={user.nome || "profilo"} height={100} width={100} className="size-full object-cover" />
                  : <UserIcon />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div className="mx-auto my-20 max-w-2xl"></div>
      <Pricing />
    </main>
  );
}
