"use client";

import React from "react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { DocumentUploadModal } from "./document-upload-modal";

interface DocumentPageHeaderProps {
  anno: string;
  selectedCount: number;
  isLoading: boolean;
  isDownloadingBulk: boolean;
  isDeletingBulk: boolean;
  onRefresh: () => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onUploadComplete: () => void;
}

export function DocumentPageHeader({
  anno,
  selectedCount,
  isLoading,
  isDownloadingBulk,
  isDeletingBulk,
  onRefresh,
  onBulkDownload,
  onBulkDelete,
  onUploadComplete,
}: DocumentPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold">
          Documenti
          {anno}
        </h1>
        <p className="text-muted-foreground">
          Gestisci i tuoi documenti per l'anno
          {" "}
          {anno}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Aggiorna
        </Button>

        {selectedCount > 0 && (
          <>
            <Button
              variant="outline"
              onClick={onBulkDownload}
              disabled={isDownloadingBulk}
            >
              <Download className="size-4" />
              Scarica (
              {selectedCount}
              )
            </Button>
            <Button
              variant="destructive"
              onClick={onBulkDelete}
              disabled={isDeletingBulk}
            >
              <Trash2 className="size-4" />
              Elimina (
              {selectedCount}
              )
            </Button>
          </>
        )}

        <DocumentUploadModal
          onUploadComplete={onUploadComplete}
          maxFiles={10}
        />
      </div>
    </div>
  );
}
