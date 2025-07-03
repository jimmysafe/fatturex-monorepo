// Main Components
export { DocumentGridList, default as DocumentGridListComponent } from "./document-grid-list";
export { DocumentPageHeader } from "./document-page-header";
export { DocumentSearchFilter, default as DocumentSearchFilterComponent } from "./document-search-filter";
export { DocumentStatisticsCards } from "./document-statistics-cards";
export { DocumentUpload } from "./document-upload";
// Demo Components
export { DocumentUploadDemo } from "./document-upload-demo";

export { DocumentUploadModal } from "./document-upload-modal";

export { useDocumentActions } from "./hooks/use-document-actions";
export { useDocumentData } from "./hooks/use-document-data";
// Hooks
export { sortDocuments, useDocumentGrid } from "./hooks/use-document-grid";

// Types - Centralized exports from types.ts
export type {
  Document,
  DocumentAction,
  DocumentFilters,
  DocumentStatistics,
  FilterOption,
  SortField,
  SortOrder,
  UploadProgress,
  ViewMode,
} from "./types";
