import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { TextRow } from "@repo/ui/components/ui/text-row";
import { LogOut } from "lucide-react";

import { LogoutButton } from "@/components/common/logout-button";
import { session } from "@/lib/session";

export function ProfiloCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[374px]" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const { user } = await session();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          Profilo
          <LogoutButton variant="ghost" className="text-destructive">
            <LogOut />
            Esci
          </LogoutButton>
        </CardTitle>
        <CardDescription>Informazioni Generali</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <TextRow label="Nome" value={user?.nome} />
        <TextRow label="Cognome" value={user?.cognome} />
        <TextRow label="Email" value={user?.email} />
        <TextRow label="Cassa di appartenenza" value={user?.cassa} />
      </CardContent>
    </Card>
  );
}
