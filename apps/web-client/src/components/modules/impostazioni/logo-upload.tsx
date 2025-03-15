"use client";
import { useActionState, useEffect, useRef, useState } from "react";

import type { getUserSubscription } from "@repo/database/queries/subscription";

import { MAX_FILE_SIZE } from "@repo/shared/const";
import { getPlan } from "@repo/shared/plans";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import type { session } from "@/lib/session";

import { env } from "@/env";
import { logoUpload } from "@/server/actions/impostazioni";

import { UpgradeModal } from "../abbonamento/upgrade-modal";

export function LogoUpload({ user, subscription }: { user: Awaited<ReturnType<typeof session>>["user"]; subscription: Awaited<ReturnType<typeof getUserSubscription>> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [[uploadData, error], submitAction, isPending] = useActionState(logoUpload, [null, null]);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (error) {
      toast.error("Errore durante il caricamento del logo");
    }
    if (uploadData) {
      toast.success("Logo caricato con successo");
      setFile(null);
    }
  }, [uploadData, error]);

  const planLabel = getPlan(subscription?.planId)?.label;

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Il file non può superare 1MB");
        setFile(null);
      }

      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <form action={submitAction} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Carica il tuo logo. Sarà visualizzato sulle tue fatture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="shrink-0">
              <div className="relative aspect-square size-24 overflow-hidden rounded-md border">
                <Image
                  src={logoPreview || (user?.logoPath ? `${env.NEXT_PUBLIC_BUCKET_URL}${user.logoPath}` : "/assets/image-placeholder.svg")}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-2">
                <input
                  name="file"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoChange}
                  className="hidden flex-1"
                  ref={fileInputRef}
                />
                <Button type="button" className="flex-1 justify-start bg-card font-normal" variant="outline" onClick={triggerFileSelect}>
                  {(file && logoPreview) ? file.name : "Scegli Logo"}
                </Button>
                {planLabel && (planLabel !== "Free") ? (
                  <Button type="submit" className="shrink-0" loading={isPending} disabled={!logoPreview}>
                    { !isPending && <Upload className="mr-2 size-4" /> }
                    Carica
                  </Button>
                ) : (
                  <UpgradeModal
                    trigger={(
                      <Button type="submit" className="shrink-0" loading={isPending} disabled={!logoPreview}>
                        { !isPending && <Upload className="mr-2 size-4" /> }
                        Carica
                      </Button>
                    )}
                  />
                )}
              </div>
              <p className="text-[0.8rem] text-muted-foreground">PNG, JPG, Massima dimensione del file: 1MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
