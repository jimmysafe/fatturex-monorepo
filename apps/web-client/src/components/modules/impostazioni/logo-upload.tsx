"use client";
import { useActionState, useEffect, useState } from "react";

import type { getUserSubscription } from "@repo/database/queries/subscription";

import { MAX_FILE_SIZE } from "@repo/shared/const";
import { getPlan } from "@repo/shared/plans";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { cn } from "@repo/ui/lib/utils";
import { CheckIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import type { session } from "@/lib/session";

import { env } from "@/env";
import { logoUpload } from "@/server/actions/impostazioni";

import { UpgradeModal } from "../abbonamento/upgrade-modal";

export function LogoUpload({ user, subscription }: { user: Awaited<ReturnType<typeof session>>["user"]; subscription: Awaited<ReturnType<typeof getUserSubscription>> }) {
  const [[uploadData, error], submitAction, isPending] = useActionState(logoUpload, [null, null]);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (error) {
      toast.error("Errore durante il caricamento del logo");
    }
    if (uploadData) {
      setFile(null);
    }
  }, [uploadData, error]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      toast.error("Il file non può superare 1MB");
      e.target.value = ""; // Reset input
      return;
    }

    setFile(selectedFile ?? null);
  };

  const planLabel = getPlan(subscription?.planId)?.label;

  return (
    <form action={submitAction} className="flex max-w-36 flex-col gap-2">
      <Label>Logo</Label>
      <div className="relative flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
        <input
          type="file"
          name="file"
          required
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          className={cn(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
            isPending && "pointer-events-none",
          )}
        />
        {file || user.logoPath ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <Image src={file ? URL.createObjectURL(file) : `${env.NEXT_PUBLIC_BUCKET_URL}${user.logoPath}`} height={64} width={64} alt="Logo" className="mb-2 aspect-square size-16" />
          </div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageIcon className="mb-2 size-8" />
            <p className="text-sm font-medium">
              Scegli Logo
            </p>
            <p className="absolute -bottom-5 left-0 text-xs">PNG, JPG max 1MB</p>
          </div>
        )}

      </div>
      {file
        ? planLabel && (planLabel !== "Free") ? (
          <Button loading={isPending} size="sm" type="submit">
            { !isPending && <CheckIcon /> }
            Conferma
          </Button>
        ) : (
          <UpgradeModal
            trigger={(
              <Button size="sm">
                { !isPending && <CheckIcon /> }
                Conferma
              </Button>
            )}
          />
        ) : <></>}
    </form>

  );
}
