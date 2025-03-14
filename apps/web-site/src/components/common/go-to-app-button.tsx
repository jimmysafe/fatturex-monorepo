"use client";

import type { ReactNode } from "react";

import type { ButtonProps } from "@repo/ui/components/ui/button";

import { Button } from "@repo/ui/components/ui/button";
import { track } from "@vercel/analytics";
import Link from "next/link";

import { getAppUrl } from "@/lib/app-url";

export function GoToAppButton({ text, children, trackLocation, ...props }: ButtonProps & { children?: ReactNode; text: string; trackLocation?: string }) {
  function handleTrack() {
    // eslint-disable-next-line node/no-process-env
    if (process.env.NODE_ENV !== "production")
      return;
    track(text, trackLocation ? { location: trackLocation } : undefined);
  }

  return (
    <Link href={getAppUrl()}>
      <Button
        {...props}
        onClick={handleTrack}
      >
        {children}
        Inizia Ora
      </Button>
    </Link>
  );
}
