/**
 * Document-related TypeScript interfaces for type safety and extensibility
 */

export interface DocumentMetadata {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  originalName?: string;
  type?: string;
  description?: string;
  tags?: string[];
}

export interface DocumentUploadResult {
  originalName: string;
  size: number;
  type: string;
  url: string;
  pathname: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  uploads: DocumentUploadResult[];
  message: string;
}

export interface DocumentListResponse {
  documents: DocumentMetadata[];
  count: number;
}

export interface DocumentOperationResponse {
  success: boolean;
  message: string;
}

export interface BulkDeleteResponse extends DocumentOperationResponse {
  deleted: number;
  failed: number;
}

export interface DocumentDownloadResponse {
  downloadUrl: string;
  expiresAt: Date;
}

export interface DocumentUpdateResponse extends DocumentOperationResponse {
  metadata: Record<string, any>;
}

// Extensible document filters for future search functionality
export interface DocumentFilters {
  type?: string;
  sizeMin?: number;
  sizeMax?: number;
  uploadedAfter?: Date;
  uploadedBefore?: Date;
  search?: string;
  tags?: string[];
}

// Document sorting options
export type DocumentSortField = "name" | "size" | "uploadedAt" | "type";
export type DocumentSortOrder = "asc" | "desc";

export interface DocumentSortOptions {
  field: DocumentSortField;
  order: DocumentSortOrder;
}

// Pagination for document lists
export interface DocumentPagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

// Enhanced document list request with filters, sorting, and pagination
export interface DocumentListRequest {
  anno: string;
  filters?: DocumentFilters;
  sort?: DocumentSortOptions;
  pagination?: DocumentPagination;
}

// File type categories for UI organization
export enum DocumentCategory {
  IMAGE = "image",
  DOCUMENT = "document",
  SPREADSHEET = "spreadsheet",
  PRESENTATION = "presentation",
  ARCHIVE = "archive",
  TEXT = "text",
  OTHER = "other",
}

export interface DocumentCategoryInfo {
  category: DocumentCategory;
  icon: string;
  color: string;
  extensions: string[];
}

// Document permission levels for future access control
export enum DocumentPermission {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  SHARE = "share",
}

export interface DocumentAccessControl {
  userId: string;
  permissions: DocumentPermission[];
  expiresAt?: Date;
}

// Future extension interfaces
export interface DocumentVersion {
  version: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  comment?: string;
}

export interface DocumentWithVersions extends DocumentMetadata {
  versions: DocumentVersion[];
  currentVersion: number;
}

// Audit log for document operations
export interface DocumentAuditLog {
  id: string;
  documentUrl: string;
  action: "upload" | "download" | "delete" | "update" | "share";
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
