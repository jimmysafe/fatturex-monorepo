"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { useMediaQuery } from "@repo/ui/hooks/use-media-query";
import { cn } from "@repo/ui/lib/utils";
import * as React from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

interface BaseProps {
  children: React.ReactNode;
}

export interface RootCredenzaProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CredenzaProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const desktop = "(min-width: 768px)";

function Credenza({ children, ...props }: RootCredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const Credenza = isDesktop ? Sheet : Drawer;

  return <Credenza {...props}>{children}</Credenza>;
}

function CredenzaTrigger({ className, children, ...props }: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaTrigger = isDesktop ? SheetTrigger : DrawerTrigger;

  return (
    <CredenzaTrigger className={className} {...props}>
      {children}
    </CredenzaTrigger>
  );
}

function CredenzaClose({ className, children, ...props }: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaClose = isDesktop ? SheetClose : DrawerClose;

  return (
    <CredenzaClose className={className} {...props}>
      {children}
    </CredenzaClose>
  );
}

function CredenzaContent({ className, children, ...props }: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaContent = isDesktop ? SheetContent : DrawerContent;

  return (
    <CredenzaContent
      className={cn("flex flex-col md:max-h-full max-h-[80vh] h-full", isDesktop ? className : "")}
      {...props}
    >
      {children}
    </CredenzaContent>
  );
}

function CredenzaDescription({
  className,
  children,
  ...props
}: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaDescription = isDesktop ? SheetDescription : DrawerDescription;

  return (
    <CredenzaDescription className={className} data-testid="dialog-description" {...props}>
      {children}
    </CredenzaDescription>
  );
}

function CredenzaHeader({ className, children, ...props }: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaHeader = isDesktop ? SheetHeader : DrawerHeader;

  return (
    <CredenzaHeader className={className} {...props}>
      {children}
    </CredenzaHeader>
  );
}

function CredenzaTitle({ className, children, ...props }: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaTitle = isDesktop ? SheetTitle : DrawerTitle;

  return (
    <CredenzaTitle className={className} data-testid="dialog-title" {...props}>
      {children}
    </CredenzaTitle>
  );
}

function CredenzaBody({ className, children, ...props }: CredenzaProps) {
  return (
    <ScrollArea className="h-full">
      <div
        className={cn(
          "px-4 md:px-2 py-6 flex-1 lg:max-h-full max-h-96",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ScrollArea>
  );
}

function CredenzaFooter({ className, children, ...props }: CredenzaProps) {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaFooter = isDesktop ? SheetFooter : DrawerFooter;

  return (
    <CredenzaFooter className={cn({ "space-y-4": isDesktop }, className)} {...props}>
      {children}
    </CredenzaFooter>
  );
}

function CredenzaSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </div>
  )
}

export {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
  CredenzaSkeleton
};
