"use client";

import { useCallback } from "react";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Import our document management components
import {
  DocumentGridList,
  DocumentPageHeader,
  DocumentSearchFilter,
  useDocumentActions,
  useDocumentData,
  useDocumentGrid,
} from "@/components/modules/documenti";

export default function DocumentiPage() {
  const params = useParams();
  const anno = params.anno as string;

  // Document grid state management
  const {
    viewMode,
    sortField,
    sortOrder,
    selectedIds,
    setViewMode,
    setSelectedIds,
    clearSelection,
  } = useDocumentGrid({
    defaultViewMode: "grid",
    defaultSortField: "date",
    defaultSortOrder: "desc",
    storageKey: `fatturex-documents-${anno}`,
  });

  // Document data management
  const {
    allDocuments,
    filteredAndSortedDocuments,
    statistics,
    filters,
    setFilters,
    filterOptions,
    isLoading,
    loadData,
  } = useDocumentData({
    anno,
    sortField,
    sortOrder,
  });

  // Document actions management
  const {
    handleDocumentAction,
    handleBulkDownload,
    handleBulkDelete,
    isDownloadingBulk,
    isDeletingBulk,
  } = useDocumentActions({
    onDataRefresh: loadData,
  });

  // Additional handlers
  const handleSortChange = useCallback((field: typeof sortField, order: typeof sortOrder) => {
    // Note: We're using local sorting, so we don't need to update the hook here
    // The hook is used for persistence only
  }, []);

  const handleRefresh = useCallback(() => {
    loadData();
    toast.success("Documenti aggiornati");
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DocumentPageHeader
        anno={anno}
        selectedCount={selectedIds.length}
        isLoading={isLoading}
        isDownloadingBulk={isDownloadingBulk}
        isDeletingBulk={isDeletingBulk}
        onRefresh={handleRefresh}
        onBulkDownload={() => handleBulkDownload(selectedIds, anno, clearSelection)}
        onBulkDelete={() => handleBulkDelete(selectedIds, anno, clearSelection)}
        onUploadComplete={loadData}
      />

      {/* Statistics Cards */}
      {/* {statistics && (
        <DocumentStatisticsCards
          statistics={statistics}
          allDocuments={allDocuments}
          filteredDocuments={filteredAndSortedDocuments}
          selectedCount={selectedIds.length}
          viewMode={viewMode}
        />
      )} */}

      {/* Search and Filters */}
      <DocumentSearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={filterOptions.categories}
        availableMimeTypes={filterOptions.mimeTypes}
        availableTags={filterOptions.tags}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalDocuments={allDocuments.length}
        filteredDocuments={filteredAndSortedDocuments.length}
        isLoading={isLoading}
      />

      {/* Document Grid/List */}
      {isLoading && allDocuments.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="size-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DocumentGridList
          documents={filteredAndSortedDocuments}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onDocumentAction={handleDocumentAction}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
