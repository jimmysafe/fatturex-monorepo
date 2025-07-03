"use client";

import { useCallback } from "react";

import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import {
  bulkDeleteDocuments,
  downloadMultipleDocuments,
  getDocumentDownloadUrl,
} from "@/server/actions/documents";

import type { Document } from "../types";

interface UseDocumentActionsOptions {
  onDataRefresh?: () => void;
}

export function useDocumentActions({ onDataRefresh }: UseDocumentActionsOptions = {}) {
  // Server actions
  const { execute: executeGetDownloadUrl } = useServerAction(getDocumentDownloadUrl);
  const { execute: executeBulkDownload, isPending: isDownloadingBulk } = useServerAction(downloadMultipleDocuments);
  const { execute: executeBulkDelete, isPending: isDeletingBulk } = useServerAction(bulkDeleteDocuments);

  // Single document download
  const handleDocumentDownload = useCallback(async (document: Document) => {
    try {
      toast.loading(`Preparazione download per: ${document.displayName}`, { id: `download-${document.id}` });

      // Get secure download URL
      const result = await executeGetDownloadUrl({
        id: document.id,
        expirationMinutes: 60, // 1 hour expiration
        downloadType: "secure",
      });

      if (result?.[0]?.success && result[0].download?.directUrl) {
        // Fetch the file and create a blob for download
        const response = await fetch(result[0].download.directUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create temporary download link
        const link = window.document.createElement("a");
        link.href = url;
        link.download = document.originalName;
        link.style.display = "none";

        // Trigger download
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(url);

        toast.success(`Scaricato: ${document.displayName}`, { id: `download-${document.id}` });
      }
      else {
        throw new Error("Impossibile ottenere l'URL di download");
      }
    }
    catch (error) {
      console.error("Download error:", error);
      toast.error(`Errore nel download: ${document.displayName}`, { id: `download-${document.id}` });
    }
  }, [executeGetDownloadUrl]);

  // Document edit (placeholder)
  const handleDocumentEdit = useCallback((document: Document) => {
    // TODO: Implement document edit modal
    toast.info(`Modifica: ${document.displayName}`);
  }, []);

  // Combined document action handler
  const handleDocumentAction = useCallback(async (action: "download" | "edit", document: Document) => {
    switch (action) {
      case "download":
        await handleDocumentDownload(document);
        break;
      case "edit":
        handleDocumentEdit(document);
        break;
    }
  }, [handleDocumentDownload, handleDocumentEdit]);

  // Bulk download with ZIP buffer handling
  const handleBulkDownload = useCallback(async (selectedIds: string[], anno: string, clearSelection: () => void) => {
    if (selectedIds.length === 0) {
      toast.error("Seleziona almeno un documento");
      return;
    }

    try {
      toast.loading(`Preparazione download ZIP per ${selectedIds.length} documenti...`, { id: "bulk-download" });

      const result = await executeBulkDownload({
        ids: selectedIds,
        anno,
        includeMetadata: true,
        compressionLevel: 6,
      });

      if (result?.[0]?.success) {
        clearSelection();

        // Handle ZIP buffer download (for small files < 10MB)
        if (result[0].download?.zipBuffer) {
          try {
            // The server returns a Node.js Buffer which gets serialized as an object with numeric keys
            // We need to convert it back to a proper buffer/array
            const bufferData = result[0].download.zipBuffer as any;
            let uint8Array: Uint8Array;

            if (bufferData?.type === "Buffer" && Array.isArray(bufferData.data)) {
              // Handle serialized Node.js Buffer format: { type: 'Buffer', data: [1,2,3...] }
              uint8Array = new Uint8Array(bufferData.data);
            }
            else if (Array.isArray(bufferData)) {
              // Handle direct array format
              uint8Array = new Uint8Array(bufferData);
            }
            else if (bufferData instanceof ArrayBuffer) {
              // Handle ArrayBuffer format
              uint8Array = new Uint8Array(bufferData);
            }
            else if (typeof bufferData === "object" && bufferData !== null) {
              // Handle object with numeric keys (another serialization format)
              const values = Object.values(bufferData).filter(v => typeof v === "number") as number[];
              uint8Array = new Uint8Array(values);
            }
            else {
              throw new Error("Unsupported buffer format received from server");
            }

            // Verify this looks like a ZIP file (should start with PK signature)
            if (uint8Array.length < 4 || uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
              console.warn("Buffer does not appear to be a valid ZIP file");
              console.warn("First 20 bytes:", Array.from(uint8Array.slice(0, 20)).map(b => `0x${b.toString(16).padStart(2, "0")}`).join(" "));
            }

            const blob = new Blob([uint8Array], { type: "application/zip" });
            const url = window.URL.createObjectURL(blob);

            const link = window.document.createElement("a");
            link.href = url;
            link.download = result[0].zipInfo?.filename || "documents.zip";
            link.style.display = "none";

            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success(
              `Scaricati ${result[0].summary.successful} documenti (${result[0].zipInfo?.readableSize})`,
              { id: "bulk-download" },
            );
          }
          catch (downloadError) {
            console.error("ZIP download error:", downloadError);
            console.error("Buffer data received:", result[0].download?.zipBuffer);
            toast.error("Errore nel download del file ZIP", { id: "bulk-download" });
          }
        }
        else {
          // For large files, the server might not include the buffer
          toast.info(
            `ZIP creato con ${result[0].summary.successful} documenti. Controlla la risposta del server per il link di download.`,
            { id: "bulk-download" },
          );
        }

        // Show summary if there were any failures
        if (result[0].summary.failed > 0) {
          toast.warning(
            `${result[0].summary.failed} documenti non scaricati`,
            { duration: 5000 },
          );
        }
      }
      else {
        throw new Error(result?.[0]?.message || "Unknown error occurred");
      }
    }
    catch (error) {
      console.error("Bulk download error:", error);
      toast.error("Errore nel download dei documenti", { id: "bulk-download" });
    }
  }, [executeBulkDownload]);

  // Bulk delete
  const handleBulkDelete = useCallback(async (selectedIds: string[], anno: string, clearSelection: () => void) => {
    if (selectedIds.length === 0) {
      toast.error("Seleziona almeno un documento");
      return;
    }

    // Confirmation dialog
    // eslint-disable-next-line no-alert
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.length} documenti? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      const result = await executeBulkDelete({ ids: selectedIds, anno });
      if (result?.[0]?.success) {
        toast.success(`Eliminati ${result[0].summary.successful} documenti`);
        clearSelection();
        // Trigger data refresh
        onDataRefresh?.();
      }
    }
    catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Errore nell'eliminazione dei documenti");
    }
  }, [executeBulkDelete, onDataRefresh]);

  return {
    handleDocumentAction,
    handleBulkDownload,
    handleBulkDelete,
    isDownloadingBulk,
    isDeletingBulk,
  };
}
