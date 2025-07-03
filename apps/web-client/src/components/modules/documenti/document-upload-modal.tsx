"use client";

import React from "react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Upload } from "lucide-react";

import { DocumentUpload } from "./document-upload";

interface DocumentUploadModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUploadComplete?: (results: any) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function DocumentUploadModal({
  trigger,
  open,
  onOpenChange,
  onUploadComplete,
  maxFiles = 10,
  disabled = false,
}: DocumentUploadModalProps) {
  const handleUploadComplete = (results: any) => {
    onUploadComplete?.(results);
    // Auto-close modal on successful upload
    if (results?.success && onOpenChange) {
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  };

  const defaultTrigger = (
    <Button disabled={disabled}>
      <Upload className="mr-2 size-4" />
      Carica Documenti
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Carica Documenti</DialogTitle>
          <DialogDescription>
            Trascina i file qui o clicca per selezionarli. Puoi caricare fino a
            {" "}
            {maxFiles}
            {" "}
            file contemporaneamente.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            maxFiles={maxFiles}
            disabled={disabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
