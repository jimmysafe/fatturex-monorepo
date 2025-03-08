"use client"

import * as React from "react"

import { cn } from "@repo/ui/lib/utils"
import { useMediaQuery } from "@repo/ui/hooks/use-media-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

interface BaseProps {
  children: React.ReactNode
}

export interface RootCredenzaDialogProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CredenzaDialogProps extends BaseProps {
  className?: string
  asChild?: true
}

const CredenzaDialogContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

const useCredenzaDialogContext = () => {
  const context = React.useContext(CredenzaDialogContext);
  if (!context) {
    throw new Error(
      "CredenzaDialog components cannot be rendered outside the CredenzaDialog Context",
    );
  }
  return context;
};

const CredenzaDialog = ({ children, ...props }: RootCredenzaDialogProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const CredenzaDialog = isDesktop ? Dialog : Drawer;

  return (
    <CredenzaDialogContext.Provider value={{ isDesktop }}>
      <CredenzaDialog {...props} {...(!isDesktop && { autoFocus: true })}>
        {children}
      </CredenzaDialog>
    </CredenzaDialogContext.Provider>
  );
};


const CredenzaDialogTrigger = ({ className, children, ...props }: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <CredenzaDialogTrigger className={className} {...props}>
      {children}
    </CredenzaDialogTrigger>
  );
};

const CredenzaDialogClose = ({ className, children, ...props }: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <CredenzaDialogClose className={className} {...props}>
      {children}
    </CredenzaDialogClose>
  );
};

const CredenzaDialogContent = ({ className, children, ...props }: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogContent = isDesktop ? DialogContent : DrawerContent;

  return (
    <CredenzaDialogContent className={cn('md:max-h-fit max-h-[80vh] md:h-auto h-full', className)} {...props}>
      {children}
    </CredenzaDialogContent>
  );
};

const CredenzaDialogDescription = ({
  className,
  children,
  ...props
}: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogDescription = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <CredenzaDialogDescription className={className} {...props}>
      {children}
    </CredenzaDialogDescription>
  );
};

const CredenzaDialogHeader = ({ className, children, ...props }: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogHeader = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <CredenzaDialogHeader className={className} {...props}>
      {children}
    </CredenzaDialogHeader>
  );
};

const CredenzaDialogTitle = ({ className, children, ...props }: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogTitle = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <CredenzaDialogTitle className={className} {...props}>
      {children}
    </CredenzaDialogTitle>
  );
};

const CredenzaDialogBody = ({ className, children, ...props }: CredenzaDialogProps) => {
  return (
    <ScrollArea className="h-full">
      <div
        className={cn(
          "px-4 md:px-2 py-6 flex-1 md:max-h-fit max-h-96",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ScrollArea>
  );
};

const CredenzaDialogFooter = ({ className, children, ...props }: CredenzaDialogProps) => {
  const { isDesktop } = useCredenzaDialogContext();
  const CredenzaDialogFooter = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <CredenzaDialogFooter className={className} {...props}>
      {children}
    </CredenzaDialogFooter>
  );
};

export {
  CredenzaDialog,
  CredenzaDialogTrigger,
  CredenzaDialogClose,
  CredenzaDialogContent,
  CredenzaDialogDescription,
  CredenzaDialogHeader,
  CredenzaDialogTitle,
  CredenzaDialogBody,
  CredenzaDialogFooter,
}