import { Suspense } from "react";

import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { _getUserSubscription } from "@/lib/cached/get-subscription";
import { session } from "@/lib/session";

import { LogoUpload } from "./logo-upload";
import { ThemeColorPicker } from "./theme-color-picker";

export function ThemeSettingsCard() {
  return (
    <Suspense fallback={<Skeleton className="h-[286px]" />}>
      <Content />
    </Suspense>
  );
}
async function Content() {
  const subscription = await _getUserSubscription();
  const { user } = await session();

  return (
    <div className="space-y-8">
      <LogoUpload subscription={subscription} user={user} />
      <ThemeColorPicker subscription={subscription} user={user} />
    </div>
  );
}
