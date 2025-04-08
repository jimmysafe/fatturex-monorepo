"use client";
import { authClient } from "@repo/auth/client";
import { ImpersonateDialog } from "@repo/auth/components/impersonate-dialog";
import { ImpersonatingOverlay } from "@repo/auth/components/impersonate-overlay";
import { Button } from "@repo/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";
import { Separator } from "@repo/ui/components/ui/separator";
import { DramaIcon, XIcon } from "lucide-react";

export function Impersonate() {
  const { data, isPending } = authClient.useSession();
  if (isPending)
    return null;
  if (!data?.session.impersonatedBy && data?.user.role !== "admin")
    return null;
  return (
    <div className="fixed z-50" style={{ bottom: 30, left: 30 }}>
      <ImpersonatingOverlay active={!!data?.session.impersonatedBy} />
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon">
            <DramaIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="end" sideOffset={10}>
          <div className="flex flex-col gap-2">
            {data?.session.impersonatedBy ? <StopImpersonateButton /> : <ImpersonateDialog />}
            <Separator />
            <div className="space-y-2 text-xs">
              <p>
                Nome:
                {" "}
                {data?.user.name}
              </p>
              <p>
                Email:
                {" "}
                {data?.user.email}
              </p>
              <p>
                Ruolo:
                {" "}
                {data?.user.role}
              </p>
              <p>
                ID:
                {" "}
                {data?.user.id}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function StopImpersonateButton() {
  async function stopImpersonate() {
    const res = await authClient.admin.stopImpersonating();
    if (!res.error) {
      window.location.reload();
    }
  }

  return (
    <button type="button" className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-sm p-2 text-sm" onClick={stopImpersonate}>
      <XIcon className="size-4" />
      Stop Impersonazione
    </button>
  );
}
