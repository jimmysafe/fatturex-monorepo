import type { PropsWithChildren } from "react";

import type { RootCredenzaProps } from "@repo/ui/components/ui/credenza";

import { Button } from "@repo/ui/components/ui/button";
import { Credenza, CredenzaBody, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@repo/ui/components/ui/credenza";
import { Label } from "@repo/ui/components/ui/label";

export type ModalProps = Omit<RootCredenzaProps, "children">;

export type RootModalProps = RootCredenzaProps & {
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  closeText?: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  onConfirmLoading?: boolean;
  confirmDisabled?: boolean;
  triggerLabel?: string;
  triggerDescription?: string;
};

export function Modal({
  title,
  description,
  closeText = "Annulla",
  confirmText = "Salva",
  trigger,
  onConfirm,
  onConfirmLoading = false,
  confirmDisabled = false,
  children,
  triggerDescription,
  triggerLabel,
  ...rest
}: PropsWithChildren<RootModalProps>) {
  return (
    <Credenza {...rest}>
      {trigger && (
        <>
          {triggerLabel && <Label>{triggerLabel}</Label>}
          <CredenzaTrigger asChild>
            {trigger}
          </CredenzaTrigger>
        </>
      )}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{title}</CredenzaTitle>
          { description && <CredenzaDescription>{description}</CredenzaDescription> }
        </CredenzaHeader>
        <CredenzaBody>
          {children}
        </CredenzaBody>
        <CredenzaFooter className="gap-2">
          <CredenzaClose asChild>
            <Button type="button" variant="outline" className="w-full">{ closeText}</Button>
          </CredenzaClose>
          <Button loading={onConfirmLoading} disabled={confirmDisabled} onClick={onConfirm} type="button" className="!m-0 w-full">{ confirmText}</Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
