"use client";
import { useState } from "react";

import type { getUserSubscription } from "@repo/database/queries/subscription";

import { PRIMARY_COLOR } from "@repo/shared/const";
import { getPlan } from "@repo/shared/plans";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ColorPicker } from "@repo/ui/components/ui/color-picker";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { Check } from "lucide-react";
import { useServerAction } from "zsa-react";

import type { session } from "@/lib/session";

import { colorUpdate } from "@/server/actions/impostazioni";

import { UpgradeModal } from "../abbonamento/upgrade-modal";

export function ThemeColorPicker({ user, subscription }: { user: Awaited<ReturnType<typeof session>>["user"]; subscription: Awaited<ReturnType<typeof getUserSubscription>> }) {
  const { isPending: isChangingColor, execute: changeColor } = useServerAction(colorUpdate);
  const [color, setColor] = useState<string | null>(null);

  const planLabel = getPlan(subscription?.planId)?.label;

  const hasChangedColor = color && (color !== user.themeColor);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tema Fattura</CardTitle>
        <CardDescription>
          Personalizza il colore primario della tua fattura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Scegli Colore</Label>
          <div className="flex items-center gap-2">
            <ColorPicker onChange={setColor} value={color || user.themeColor || PRIMARY_COLOR} />
            <pre className="text-sm">{color || user.themeColor || PRIMARY_COLOR}</pre>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-end pt-6">
        {planLabel && (planLabel !== "Free") ? (
          <Button type="button" disabled={!hasChangedColor} loading={isChangingColor} onClick={() => !color ? null : changeColor({ color })}>
            {!isChangingColor && <Check className="mr-2 size-4" />}
            Salva
          </Button>
        ) : (
          <UpgradeModal
            trigger={(
              <Button type="button" disabled={!hasChangedColor} loading={isChangingColor}>
                {!isChangingColor && <Check className="mr-2 size-4" />}
                Salva
              </Button>
            )}
          />
        )}
      </CardFooter>
    </Card>
  );
}
