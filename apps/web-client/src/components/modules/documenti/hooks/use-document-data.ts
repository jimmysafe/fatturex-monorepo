"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";
import { useServerAction } from "zsa-react";

import {
  getDocuments,
  getDocumentStatistics,
  searchDocumentsByQuery,
} from "@/server/actions/documents";

import type { Document, DocumentFilters, FilterOption } from "../types";
import type { SortField } from "./use-document-grid";

import { sortDocuments } from "./use-document-grid";

// Helper function to transform server response to component format
function transformDocumentData(serverDoc: any): Document {
  return {
    id: serverDoc.id,
    originalName: serverDoc.originalName,
    displayName: serverDoc.displayName || serverDoc.originalName,
    mimeType: serverDoc.mimeType,
    size: serverDoc.size,
    blobUrl: serverDoc.blobUrl,
    anno: serverDoc.anno,
    category: serverDoc.category,
    description: serverDoc.description,
    tags: serverDoc.tags ? (typeof serverDoc.tags === "string" ? JSON.parse(serverDoc.tags) : serverDoc.tags) : [],
    createdAt: new Date(serverDoc.createdAt),
    updatedAt: new Date(serverDoc.updatedAt),
  };
}

// Helper function to generate filter options from documents
function generateFilterOptions(documents: Document[]): {
  categories: FilterOption[];
  mimeTypes: FilterOption[];
  tags: FilterOption[];
} {
  const categoryMap = new Map<string, number>();
  const mimeTypeMap = new Map<string, number>();
  const tagMap = new Map<string, number>();

  documents.forEach((doc) => {
    // Categories
    if (doc.category) {
      categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
    }

    // MIME types - group similar types
    let mimeGroup = doc.mimeType;
    if (doc.mimeType.startsWith("image/"))
      mimeGroup = "image/*";
    else if (doc.mimeType === "application/pdf")
      mimeGroup = "application/pdf";
    else if (doc.mimeType.includes("spreadsheet") || doc.mimeType.includes("excel"))
      mimeGroup = "spreadsheet";
    else if (doc.mimeType.includes("document") || doc.mimeType.includes("word"))
      mimeGroup = "document";
    else mimeGroup = "other";

    mimeTypeMap.set(mimeGroup, (mimeTypeMap.get(mimeGroup) || 0) + 1);

    // Tags
    if (doc.tags) {
      doc.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });

  const categories: FilterOption[] = Array.from(categoryMap.entries()).map(([value, count]) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
    count,
  }));

  const mimeTypes: FilterOption[] = Array.from(mimeTypeMap.entries()).map(([value, count]) => {
    let label = value;
    switch (value) {
      case "image/*":
        label = "Immagini";
        break;
      case "application/pdf":
        label = "PDF";
        break;
      case "spreadsheet":
        label = "Fogli di calcolo";
        break;
      case "document":
        label = "Documenti";
        break;
      default:
        label = "Altri";
    }
    return { value, label, count };
  });

  const tags: FilterOption[] = Array.from(tagMap.entries())
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .slice(0, 20) // Limit to top 20 tags
    .map(([value, count]) => ({
      value,
      label: value,
      count,
    }));

  return { categories, mimeTypes, tags };
}

interface UseDocumentDataOptions {
  anno: string;
  sortField: string;
  sortOrder: "asc" | "desc";
}

export function useDocumentData({ anno, sortField, sortOrder }: UseDocumentDataOptions) {
  // Local state
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [filters, setFilters] = useState<DocumentFilters>({
    search: "",
    categories: [],
    mimeTypes: [],
    tags: [],
    dateRange: {},
    sizeRange: {},
  });

  // Server actions
  const { execute: executeGetDocuments, isPending: isLoadingDocuments } = useServerAction(getDocuments);
  const { execute: executeSearch, isPending: isSearching } = useServerAction(searchDocumentsByQuery);
  const { execute: executeGetStats, isPending: isLoadingStats } = useServerAction(getDocumentStatistics);

  // Load documents and statistics
  const loadData = useCallback(async () => {
    try {
      // Load documents
      const [documentsResult, statsResult] = await Promise.all([
        executeGetDocuments({ anno, page: "1", per_page: "1000" }),
        executeGetStats({ anno }),
      ]);

      if (documentsResult?.[0]?.documents) {
        const transformedDocs = documentsResult[0].documents.map(transformDocumentData);
        setAllDocuments(transformedDocs);
      }
      else {
        setAllDocuments([]);
      }

      if (statsResult?.[0]) {
        setStatistics(statsResult[0]);
      }
    }
    catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Errore nel caricamento dei documenti");
    }
  }, [anno, executeGetDocuments, executeGetStats]);

  // Load data on mount and when year changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = allDocuments;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.displayName.toLowerCase().includes(searchLower)
        || doc.originalName.toLowerCase().includes(searchLower)
        || doc.description?.toLowerCase().includes(searchLower)
        || doc.tags?.some(tag => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(doc =>
        doc.category && filters.categories.includes(doc.category),
      );
    }

    // Apply MIME type filter
    if (filters.mimeTypes.length > 0) {
      filtered = filtered.filter((doc) => {
        return filters.mimeTypes.some((filterType) => {
          switch (filterType) {
            case "image/*": return doc.mimeType.startsWith("image/");
            case "application/pdf": return doc.mimeType === "application/pdf";
            case "spreadsheet": return doc.mimeType.includes("spreadsheet") || doc.mimeType.includes("excel");
            case "document": return doc.mimeType.includes("document") || doc.mimeType.includes("word");
            default: return doc.mimeType === filterType;
          }
        });
      });
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(doc =>
        doc.tags && doc.tags.some(tag => filters.tags.includes(tag)),
      );
    }

    // Sort documents
    return sortDocuments(filtered, sortField as SortField, sortOrder);
  }, [allDocuments, filters, sortField, sortOrder]);

  // Generate filter options
  const filterOptions = useMemo(() =>
    generateFilterOptions(allDocuments), [allDocuments]);

  const isLoading = isLoadingDocuments || isSearching;

  return {
    // Data
    allDocuments,
    filteredAndSortedDocuments,
    statistics,

    // Filters
    filters,
    setFilters,
    filterOptions,

    // Loading states
    isLoading,
    isLoadingDocuments,
    isSearching,
    isLoadingStats,

    // Actions
    loadData,
  };
}
