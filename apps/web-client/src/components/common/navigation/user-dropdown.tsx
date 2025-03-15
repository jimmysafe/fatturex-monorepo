"use client";

import { Button } from "@repo/ui/components/ui/button";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { AuthUser } from "@/server/types";

export function UserDropdown({ user }: { user: AuthUser }) {
  const { anno } = useParams<{ anno: string }>();
  return (
    <Button data-testid="user-button" variant="outline" size="icon" className="overflow-hidden" asChild>
      <Link href={`/${anno}/profilo`}>
        {user?.image
          ? <Image src={user.image} alt={user.nome || "profilo"} height={100} width={100} className="size-full object-cover" />
          : <UserIcon />}
      </Link>
    </Button>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button data-testid="user-button" variant="outline" size="icon" className="overflow-hidden">
    //       {user?.image
    //         ? <Image src={user.image} alt={user.nome || "profilo"} height={100} width={100} className="size-full object-cover" />
    //         : <UserIcon />}
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent>
    //     <DropdownMenuItem asChild>
    //       <Link href={`/${anno}/profilo`}>Profilo</Link>
    //     </DropdownMenuItem>
    //     <DropdownMenuItem asChild>
    //       <Link href={`/${anno}/impostazioni`}>Impostazioni</Link>
    //     </DropdownMenuItem>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem onClick={async () => {
    //       await authClient.signOut();
    //       router.push("/signin");
    //     }}
    //     >
    //       Esci
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  );
}
