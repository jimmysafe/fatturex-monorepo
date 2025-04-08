"use client";
import { useState } from "react";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { AsyncSelect } from "@repo/ui/components/ui/select-async";
import { DramaIcon } from "lucide-react";
import { toast } from "sonner";

export function ImpersonateDialog() {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const onSubmit = async (userId: string | null) => {
    if (!userId)
      return;
    const res = await authClient.admin.impersonateUser({
      userId,
    });
    if (!res.error) {
      window.location.reload();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-sm p-2 text-sm">
          <DramaIcon className="size-4" />
          Impersona Utente
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impersona</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AsyncSelect<any>
            renderOption={option => option.name}
            getOptionValue={option => option.id}
            getDisplayValue={option => option.name}
            value={userId || ""}
            onChange={setUserId}
            width="full"
            fetcher={async (query) => {
              const res = await authClient.admin.listUsers({
                query: {
                  limit: 10,
                  searchField: "name",
                  searchValue: query,
                  searchOperator: "contains",
                },
              });
              if (res.error) {
                toast.error(res.error.message);
                return [];
              };
              return res.data.users.map(user => ({ id: user.id, name: user.name }));
            }}
          />
          <DialogFooter>
            <Button onClick={() => onSubmit(userId)}>Conferma</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
