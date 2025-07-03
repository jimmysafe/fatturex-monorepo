"use client";

import { useCallback, useEffect, useState } from "react";

export type ViewMode = "grid" | "list";
export type SortField = "name" | "size" | "date" | "type";
export type SortOrder = "asc" | "desc";

interface UseDocumentGridOptions {
  defaultViewMode?: ViewMode;
  defaultSortField?: SortField;
  defaultSortOrder?: SortOrder;
  persistPreferences?: boolean;
  storageKey?: string;
}

interface DocumentGridState {
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  selectedIds: string[];
}

interface DocumentGridActions {
  setViewMode: (mode: ViewMode) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  setSelectedIds: (ids: string[]) => void;
  selectAll: (documentIds: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
  resetPreferences: () => void;
}

const DEFAULT_STORAGE_KEY = "fatturex-document-grid-preferences";

export function useDocumentGrid({
  defaultViewMode = "grid",
  defaultSortField = "date",
  defaultSortOrder = "desc",
  persistPreferences = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: UseDocumentGridOptions = {}): DocumentGridState & DocumentGridActions {
  // Load initial state from localStorage if persistence is enabled
  const getInitialState = useCallback((): DocumentGridState => {
    if (persistPreferences && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            viewMode: parsed.viewMode || defaultViewMode,
            sortField: parsed.sortField || defaultSortField,
            sortOrder: parsed.sortOrder || defaultSortOrder,
            selectedIds: [], // Never persist selection
          };
        }
      }
      catch (error) {
        console.warn("Failed to load document grid preferences:", error);
      }
    }

    return {
      viewMode: defaultViewMode,
      sortField: defaultSortField,
      sortOrder: defaultSortOrder,
      selectedIds: [],
    };
  }, [defaultViewMode, defaultSortField, defaultSortOrder, persistPreferences, storageKey]);

  const [state, setState] = useState<DocumentGridState>(getInitialState);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (persistPreferences && typeof window !== "undefined") {
      try {
        const toSave = {
          viewMode: state.viewMode,
          sortField: state.sortField,
          sortOrder: state.sortOrder,
          // Don't save selectedIds
        };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      }
      catch (error) {
        console.warn("Failed to save document grid preferences:", error);
      }
    }
  }, [state.viewMode, state.sortField, state.sortOrder, persistPreferences, storageKey]);

  // Actions
  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  const setSortField = useCallback((sortField: SortField) => {
    setState(prev => ({ ...prev, sortField }));
  }, []);

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    setState(prev => ({ ...prev, sortOrder }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  }, []);

  const setSelectedIds = useCallback((selectedIds: string[]) => {
    setState(prev => ({ ...prev, selectedIds }));
  }, []);

  const selectAll = useCallback((documentIds: string[]) => {
    setState(prev => ({ ...prev, selectedIds: documentIds }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIds: [] }));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id],
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    const newState = {
      viewMode: defaultViewMode,
      sortField: defaultSortField,
      sortOrder: defaultSortOrder,
      selectedIds: state.selectedIds, // Keep current selection
    };
    setState(newState);

    // Clear localStorage
    if (persistPreferences && typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      }
      catch (error) {
        console.warn("Failed to clear document grid preferences:", error);
      }
    }
  }, [defaultViewMode, defaultSortField, defaultSortOrder, state.selectedIds, persistPreferences, storageKey]);

  return {
    // State
    viewMode: state.viewMode,
    sortField: state.sortField,
    sortOrder: state.sortOrder,
    selectedIds: state.selectedIds,

    // Actions
    setViewMode,
    setSortField,
    setSortOrder,
    toggleSortOrder,
    setSelectedIds,
    selectAll,
    clearSelection,
    toggleSelection,
    resetPreferences,
  };
}

// Helper function to sort documents
export function sortDocuments<T extends {
  originalName: string;
  displayName: string;
  size: number;
  createdAt: Date;
  mimeType: string;
}>(documents: T[], sortField: SortField, sortOrder: SortOrder): T[] {
  const sorted = [...documents].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.displayName.localeCompare(b.displayName, "it", {
          numeric: true,
          sensitivity: "base",
        });
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "date":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case "type":
        comparison = a.mimeType.localeCompare(b.mimeType);
        break;
      default:
        return 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export default useDocumentGrid;
