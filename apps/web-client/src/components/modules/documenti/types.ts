// Document types
export interface Document {
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
  readableSize?: string;
  uploadedAgo?: string;
  isPreviewable?: boolean;
}

// Filter types
export interface DocumentFilters {
  search: string;
  categories: string[];
  mimeTypes: string[];
  tags: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  sizeRange: {
    min?: number;
    max?: number;
  };
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Grid/List view types
export type ViewMode = "grid" | "list";
export type SortField = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";

// Action types
export type DocumentAction = "download" | "edit";

// Upload types
export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

// Statistics types
export interface DocumentStatistics {
  totalDocuments: number;
  totalSize: number;
  readableTotalSize: string;
  categories: { [key: string]: number };
  mimeTypes: { [key: string]: number };
}
