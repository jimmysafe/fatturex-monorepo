"use client";

import { useState } from "react";

import type { getUserSubscription } from "@repo/database/queries/subscription";

import { PRIMARY_COLOR } from "@repo/shared/const";
import { getPlan } from "@repo/shared/plans";
import { Button } from "@repo/ui/components/ui/button";
import { ColorPicker } from "@repo/ui/components/ui/color-picker";
import { Label } from "@repo/ui/components/ui/label";
import { CheckIcon } from "lucide-react";
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
    <div className="flex max-w-36 flex-col gap-2">
      <Label>Colore</Label>
      <ColorPicker onChange={setColor} value={color || user.themeColor || PRIMARY_COLOR} />
      {hasChangedColor
        ? planLabel && (planLabel !== "Free") ? (
          <Button loading={isChangingColor} size="sm" onClick={() => changeColor({ color })}>
            {!isChangingColor && <CheckIcon /> }
            Conferma
          </Button>
        ) : (
          <UpgradeModal
            trigger={(
              <Button loading={isChangingColor} size="sm">
                { !isChangingColor && <CheckIcon /> }
                Conferma
              </Button>
            )}
          />
        ) : <></>}
    </div>
  );
}
