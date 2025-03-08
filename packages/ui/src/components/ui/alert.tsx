import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/ui/lib/utils"
import { LucideIcon, TriangleAlert } from "lucide-react"


const alertVariants = cva(
  "p-4 flex lg:justify-center lg:rounded-none lg:rounded-l-lg rounded-t-lg",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [&~section]:border [&~section]:border-primary/40",
        warn: "bg-warn text-warn-foreground [&>svg]:text-warn-foreground [&~section]:border [&~section]:border-warn/40",
        destructive: "bg-destructive/90 text-destructive-foreground [&>svg]:text-destructive-foreground [&~section]:border [&~section]:border-destructive/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & { icon?: LucideIcon }
>(({ className, variant, children, ...props }, ref) => {
  const Icon = props.icon || TriangleAlert
  return (
    <div
      ref={ref}
      role="alert"
      className={cn("p-0 flex md:flex-row flex-col bg-card shadow-fade rounded-lg", className)}
      {...props}
    >
      <div className={cn(alertVariants({ variant }))}>
        <Icon className="lg:size-6 size-5" />
      </div>
      <section className={cn("p-4 w-full lg:rounded-none lg:rounded-r-lg rounded-b-lg text-sm")}>
        {children}
      </section>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed mt-2 whitespace-pre-line", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
