import { cn } from "@repo/ui/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md dark:bg-primary/10 bg-muted-foreground/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
