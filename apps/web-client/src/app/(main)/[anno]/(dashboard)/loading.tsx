import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto max-w-5xl space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[170px]" />
        <Skeleton className="h-[170px]" />
        <Skeleton className="h-[170px]" />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <Skeleton className="h-[402px] w-full" />
        <Skeleton className="h-[402px] w-full" />
      </div>
    </main>
  );
}
