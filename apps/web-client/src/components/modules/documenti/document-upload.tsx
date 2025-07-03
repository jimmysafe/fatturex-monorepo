"use client";

import React, { useCallback, useRef, useState } from "react";

import { ALLOWED_DOCUMENT_TYPES, IMAGE_TYPES, MAX_DOCUMENT_SIZE } from "@repo/shared/const";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Eye,
  File,
  FileText,
  Image,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

// Import server action
import { uploadDocuments } from "@/server/actions/documents";

// Types
interface FileWithPreview {
  // File properties
  name: string;
  size: number;
  type: string;
  lastModified: number;
  webkitRelativePath: string;
  // File methods
  arrayBuffer: () => Promise<ArrayBuffer>;
  slice: (start?: number, end?: number, contentType?: string) => Blob;
  stream: () => ReadableStream<Uint8Array>;
  text: () => Promise<string>;
  // Custom properties
  id: string;
  preview?: string;
  category: string;
  uploadStatus: "pending" | "uploading" | "success" | "error";
  uploadProgress: number;
  error?: string;
}

interface DocumentUploadProps {
  onUploadComplete?: (results: any) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function getFileCategory(mimeType: string): string {
  if (IMAGE_TYPES.includes(mimeType as any)) {
    return "image";
  }
  if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) {
    return "archive";
  }
  return "document";
}

function getFileIcon(category: string, mimeType: string) {
  switch (category) {
    case "image":
      return <Image className="size-8 text-blue-500" />;
    case "archive":
      return <Archive className="size-8 text-orange-500" />;
    default:
      if (mimeType === "application/pdf") {
        return <FileText className="size-8 text-red-500" />;
      }
      return <File className="size-8 text-gray-500" />;
  }
}

function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: `La dimensione del file ${formatFileSize(file.size)} supera il limite massimo di ${formatFileSize(MAX_DOCUMENT_SIZE)}`,
    };
  }

  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Il tipo di file '${file.type}' non è consentito`,
    };
  }

  // Check filename
  if (!file.name || file.name.trim().length === 0) {
    return {
      valid: false,
      error: "Il file deve avere un nome valido",
    };
  }

  // Check for potentially dangerous file extensions
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com", ".js", ".vbs", ".jar"];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  if (dangerousExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `L'estensione '${fileExtension}' non è consentita per motivi di sicurezza`,
    };
  }

  return { valid: true };
}

function createFilePreview(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (IMAGE_TYPES.includes(file.type as any)) {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    }
    else {
      resolve(undefined);
    }
  });
}

export function DocumentUpload({
  onUploadComplete,
  onUploadStart,
  maxFiles = 10,
  className = "",
  disabled = false,
}: DocumentUploadProps) {
  const params = useParams();
  const anno = params.anno as string;

  // State
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Server action
  const { execute: executeUpload, isPending: isUploadPending } = useServerAction(uploadDocuments as any);

  // File processing
  const processFiles = useCallback(async (fileList: File[]) => {
    if (files.length + fileList.length > maxFiles) {
      toast.error(`Numero massimo di ${maxFiles} file consentiti. Rimuovi alcuni file prima.`);
      return;
    }

    const newFiles: FileWithPreview[] = [];

    for (const file of fileList) {
      const validation = validateFile(file);
      const preview = await createFilePreview(file);

      // Create a proper FileWithPreview object that includes the original file
      const fileWithPreview: FileWithPreview = {
        // Copy all File properties
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        webkitRelativePath: file.webkitRelativePath,
        // File methods
        arrayBuffer: file.arrayBuffer.bind(file),
        slice: file.slice.bind(file),
        stream: file.stream.bind(file),
        text: file.text.bind(file),
        // Add our custom properties
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preview,
        category: getFileCategory(file.type),
        uploadStatus: validation.valid ? "pending" as const : "error" as const,
        uploadProgress: 0,
        error: validation.error,
      };

      // Store reference to original file for upload
      (fileWithPreview as any).originalFile = file;

      newFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Show validation errors
    const errorFiles = newFiles.filter(f => f.uploadStatus === "error");
    if (errorFiles.length > 0) {
      toast.error(`${errorFiles.length} file con errori di validazione`);
    }
  }, [files.length, maxFiles]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled)
      return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, [disabled]);

  // File input handler
  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(Array.from(e.target.files));
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  }, [processFiles]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress(0);
  }, []);

  // Retry failed file
  const retryFile = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, uploadStatus: "pending", uploadProgress: 0, error: undefined }
        : f,
    ));
  }, []);

  // Upload files
  const handleUpload = useCallback(async () => {
    const pendingFiles = files.filter(f => f.uploadStatus === "pending");

    if (pendingFiles.length === 0) {
      toast.error("Nessun file valido da caricare");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Update file statuses to uploading
      setFiles(prev => prev.map(f =>
        f.uploadStatus === "pending"
          ? { ...f, uploadStatus: "uploading", uploadProgress: 0 }
          : f,
      ));

      // Simulate progress (since we don't have real-time progress from server action)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 15, 90);
          return newProgress;
        });
      }, 200);

      // Execute upload - use original File objects
      const originalFiles = pendingFiles.map(f => (f as any).originalFile as File);

      const [uploadResult, uploadError] = await executeUpload({
        files: originalFiles,
        anno,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw new Error(uploadError.message || "Caricamento fallito");
      }

      if (uploadResult) {
        // Update file statuses based on results
        setFiles(prev => prev.map((f) => {
          if (f.uploadStatus !== "uploading")
            return f;

          const uploadInfo = uploadResult.uploads?.find((u: any) => u.originalName === f.name);
          if (uploadInfo) {
            return {
              ...f,
              uploadStatus: uploadInfo.success ? "success" : "error",
              uploadProgress: 100,
              error: uploadInfo.error,
            };
          }

          return { ...f, uploadStatus: "error", error: "Caricamento fallito" };
        }));

        // Show results
        if (uploadResult.success) {
          toast.success(uploadResult.message);
        }
        else {
          toast.warning(uploadResult.message);
        }

        onUploadComplete?.(uploadResult);

        // Auto-clear successful files after a delay
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.uploadStatus !== "success"));
        }, 3000);
      }
      else {
        console.error("No result returned from upload");
        toast.error("Caricamento fallito - nessuna risposta dal server");

        // Mark all uploading files as error
        setFiles(prev => prev.map(f =>
          f.uploadStatus === "uploading"
            ? { ...f, uploadStatus: "error", error: "No response from server" }
            : f,
        ));
      }
    }
    catch (error) {
      console.error("Upload error:", error);
      toast.error(`Caricamento fallito: ${error instanceof Error ? error.message : "Errore sconosciuto"}`);

      // Mark all uploading files as error
      setFiles(prev => prev.map(f =>
        f.uploadStatus === "uploading"
          ? { ...f, uploadStatus: "error", error: error instanceof Error ? error.message : "Caricamento fallito" }
          : f,
      ));
    }
    finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [files, anno, executeUpload, onUploadStart, onUploadComplete]);

  // Click to select files
  const handleSelectFiles = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Statistics
  const pendingCount = files.filter(f => f.uploadStatus === "pending").length;
  const successCount = files.filter(f => f.uploadStatus === "success").length;
  const errorCount = files.filter(f => f.uploadStatus === "error").length;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const canUpload = pendingCount > 0 && !isUploading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card
        ref={dropZoneRef}
        className={`transition-all duration-200 ${
          isDragOver
            ? "border-2 border-dashed border-primary bg-primary/5"
            : "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleSelectFiles}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className={`mb-4 rounded-full p-4 ${
            isDragOver ? "bg-primary/10" : "bg-muted"
          }`}
          >
            <Upload className={`size-8 ${
              isDragOver ? "text-primary" : "text-muted-foreground"
            }`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragOver ? "Rilascia i file qui" : "Carica documenti"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Trascina e rilascia i file qui oppure clicca per selezionare i file
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span>
                Max
                {maxFiles}
                {" "}
                file
              </span>
              <span>•</span>
              <span>
                Fino a
                {formatFileSize(MAX_DOCUMENT_SIZE)}
                {" "}
                ciascuno
              </span>
              <span>•</span>
              <span>PDF, Immagini, Documenti</span>
            </div>
          </div>

          {!isDragOver && (
            <Button variant="outline" className="mt-4" disabled={disabled}>
              <Plus className="mr-2 size-4" />
              Seleziona file
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_DOCUMENT_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin" />
              <div className="flex-1">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Caricamento file in corso...</span>
                  <span>
                    {Math.round(uploadProgress)}
                    %
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold">
                File selezionati (
                {files.length}
                )
              </h4>

              <div className="flex items-center gap-2">
                {totalSize > 0 && (
                  <Badge variant="outline">
                    Totale:
                    {" "}
                    {formatFileSize(totalSize)}
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFiles}
                  disabled={isUploading}
                >
                  <Trash2 className="mr-1 size-4" />
                  Cancella tutto
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    {/* File Icon/Preview */}
                    <div className="shrink-0">
                      {file.preview ? (
                        <div className="relative">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="size-12 rounded border object-cover"
                          />
                          {file.uploadStatus === "success" && (
                            <CheckCircle className="absolute -right-1 -top-1 size-5 rounded-full bg-white text-green-500" />
                          )}
                          {file.uploadStatus === "error" && (
                            <AlertCircle className="absolute -right-1 -top-1 size-5 rounded-full bg-white text-red-500" />
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          {getFileIcon(file.category, file.type)}
                          {file.uploadStatus === "success" && (
                            <CheckCircle className="absolute -right-1 -top-1 size-5 rounded-full bg-white text-green-500" />
                          )}
                          {file.uploadStatus === "error" && (
                            <AlertCircle className="absolute -right-1 -top-1 size-5 rounded-full bg-white text-red-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="truncate font-medium">{file.name}</p>
                        <Badge
                          variant={
                            file.uploadStatus === "success" ? "default"
                              : file.uploadStatus === "error" ? "destructive"
                                : file.uploadStatus === "uploading" ? "secondary"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {file.uploadStatus === "uploading" ? "Caricamento"
                            : file.uploadStatus === "success" ? "Caricato"
                              : file.uploadStatus === "error" ? "Errore"
                                : "Pronto"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="capitalize">{file.category}</span>
                      </div>

                      {/* Upload Progress */}
                      {file.uploadStatus === "uploading" && (
                        <Progress value={file.uploadProgress} className="mt-2 h-1" />
                      )}

                      {/* Error Message */}
                      {file.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="size-4" />
                          <AlertDescription className="text-xs">
                            {file.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {file.preview && file.uploadStatus !== "uploading" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.preview, "_blank")}
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}

                      {file.uploadStatus === "error" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryFile(file.id)}
                          disabled={isUploading}
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={isUploading}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Upload Summary */}
            {files.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {pendingCount > 0 && (
                      <span>
                        {pendingCount}
                        {" "}
                        pronti per il caricamento
                      </span>
                    )}
                    {successCount > 0 && (
                      <span className="text-green-600">
                        {successCount}
                        {" "}
                        caricati
                      </span>
                    )}
                    {errorCount > 0 && (
                      <span className="text-red-600">
                        {errorCount}
                        {" "}
                        falliti
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!canUpload || disabled}
                    className="min-w-24"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Caricamento
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-4" />
                        Carica
                        {" "}
                        {pendingCount > 0 ? `(${pendingCount})` : ""}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
