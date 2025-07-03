"use client";

import { useCallback } from "react";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import {
  Calendar,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Grid3X3,
  HardDrive,
  Image as ImageIcon,
  List,
} from "lucide-react";

// Types based on our document schema
interface Document {
  id: string;
  originalName: string;
  displayName: string;
  mimeType: string;
  size: number;
  blobUrl: string;
  anno: string;
  category?: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentGridListProps {
  documents: Document[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDocumentAction?: (action: "download" | "edit", document: Document) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isLoading?: boolean;
  className?: string;
}

// Helper functions for file type detection and formatting
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return ImageIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return FileSpreadsheet;
  if (mimeType === "application/pdf")
    return FileText;
  return File;
}

function getFileTypeColor(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return "bg-green-100 text-green-800";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "bg-blue-100 text-blue-800";
  if (mimeType === "application/pdf")
    return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1)
    return "Pochi minuti fa";
  if (diffInHours < 24)
    return `${diffInHours}h fa`;
  if (diffInHours < 48)
    return "Ieri";
  if (diffInHours < 168)
    return `${Math.floor(diffInHours / 24)} giorni fa`;
  return format(date, "dd/MM/yyyy");
}

// Document Card Component for Grid View
function DocumentCard({
  document,
  isSelected,
  onSelect,
  onAction,
}: {
  document: Document;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction?: (action: "download" | "edit") => void;
}) {
  const FileIcon = getFileIcon(document.mimeType);
  const fileExtension = document.originalName.split(".").pop()?.toLowerCase() || "";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute left-3 top-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="bg-white shadow-sm"
          aria-label={`Select ${document.displayName}`}
        />
      </div>

      {/* Quick Actions */}
      <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="size-8 bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("download");
            }}
            aria-label={`Download ${document.displayName}`}
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        {/* File Preview/Icon Area */}
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50"
        >
          {document.mimeType.startsWith("image/") ? (
            <img
              src={document.blobUrl}
              alt={document.displayName}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <FileIcon className="size-12 text-gray-300" />
              {fileExtension && (
                <Badge variant="secondary" className="text-xs uppercase">
                  {fileExtension}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 p-4 md:px-0 md:pb-0">
          <h3
            className="line-clamp-1 truncate text-xs font-medium md:text-sm"
            title={document.displayName}
          >
            {document.displayName}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(document.size)}</span>
            {/* <span>{getRelativeTime(document.createdAt)}</span> */}
          </div>

          {document.category && (
            <Badge
              variant="outline"
              className={cn("text-xs", getFileTypeColor(document.mimeType))}
            >
              {document.category}
            </Badge>
          )}

          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +
                  {document.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Document Row Component for List View
function DocumentRow({
  document,
  isSelected,
  onSelect,
  onAction,
}: {
  document: Document;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction?: (action: "download" | "edit") => void;
}) {
  const FileIcon = getFileIcon(document.mimeType);
  const fileExtension = document.originalName.split(".").pop()?.toLowerCase() || "";

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-12 items-center gap-4">
          {/* Selection + Icon */}
          <div className="col-span-1 flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Select ${document.displayName}`}
            />
            <div className="relative">
              {document.mimeType.startsWith("image/") ? (
                <img
                  src={document.blobUrl}
                  alt={document.displayName}
                  className="size-10 rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded bg-gray-100">
                  <FileIcon className="size-5 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* File Name */}
          <div className="col-span-4 md:col-span-5">
            <h3
              className="line-clamp-1 cursor-pointer text-sm font-medium hover:text-primary"
              title={document.displayName}
            >
              {document.displayName}
            </h3>
            {document.description && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {document.description}
              </p>
            )}
          </div>

          {/* Category & Tags - Hidden on mobile */}
          <div className="col-span-2 hidden md:block">
            {document.category && (
              <Badge
                variant="outline"
                className={cn("text-xs", getFileTypeColor(document.mimeType))}
              >
                {document.category}
              </Badge>
            )}
          </div>

          {/* Size */}
          <div className="col-span-2 md:col-span-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <HardDrive className="size-3" />
              {formatFileSize(document.size)}
            </span>
          </div>

          {/* Date */}
          <div className="col-span-2 md:col-span-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {getRelativeTime(document.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="col-span-2 flex justify-end md:col-span-1">
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.("download");
                }}
                aria-label={`Download ${document.displayName}`}
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tags - Mobile only */}
        {document.tags && document.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 md:hidden">
            {document.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +
                {document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading Skeleton Components
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-1 flex items-center gap-3">
                <Skeleton className="size-4" />
                <Skeleton className="size-10 rounded" />
              </div>
              <div className="col-span-5">
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="col-span-2 hidden md:block">
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main Component
export function DocumentGridList({
  documents,
  selectedIds,
  onSelectionChange,
  onDocumentAction,
  viewMode,
  onViewModeChange,
  isLoading = false,
  className,
}: DocumentGridListProps) {
  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === documents.length) {
      onSelectionChange([]);
    }
    else {
      onSelectionChange(documents.map(doc => doc.id));
    }
  }, [documents, selectedIds, onSelectionChange]);

  const handleSelectDocument = useCallback((documentId: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedIds, documentId]);
    }
    else {
      onSelectionChange(selectedIds.filter(id => id !== documentId));
    }
  }, [selectedIds, onSelectionChange]);

  // Computed values
  const isAllSelected = documents.length > 0 && selectedIds.length === documents.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < documents.length;

  if (isLoading) {
    return (
      <div className={className}>
        {viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <FileText className="mb-4 size-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Nessun documento trovato</h3>
        <p className="max-w-sm text-center text-gray-500">
          Non ci sono documenti da visualizzare. Carica i tuoi primi documenti per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with View Toggle and Selection */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el && el.querySelector("input")) {
                  (el.querySelector("input") as HTMLInputElement).indeterminate = isPartiallySelected;
                }
              }}
              onCheckedChange={handleSelectAll}
              aria-label="Select all documents"
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} di ${documents.length} selezionati`
                : `${documents.length} documenti`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <Grid3X3 className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Document Grid/List */}
      {viewMode === "grid" ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          role="grid"
          aria-label="Documents grid"
        >
          {documents.map(document => (
            <div key={document.id} role="gridcell">
              <DocumentCard
                document={document}
                isSelected={selectedIds.includes(document.id)}
                onSelect={selected => handleSelectDocument(document.id, selected)}
                onAction={action => onDocumentAction?.(action, document)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="space-y-3"
          role="list"
          aria-label="Documents list"
        >
          {documents.map(document => (
            <div key={document.id} role="listitem">
              <DocumentRow
                document={document}
                isSelected={selectedIds.includes(document.id)}
                onSelect={selected => handleSelectDocument(document.id, selected)}
                onAction={action => onDocumentAction?.(action, document)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentGridList;
