"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";
import { Separator } from "@repo/ui/components/ui/separator";
import { useDebounce } from "@repo/ui/hooks/use-debounce";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  FileType,
  Filter,
  Search,
  Tag,
  X,
} from "lucide-react";

import type { SortField, SortOrder } from "./hooks/use-document-grid";

// Types
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
  count?: number;
}

interface DocumentSearchFilterProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  availableCategories: FilterOption[];
  availableMimeTypes: FilterOption[];
  availableTags: FilterOption[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  totalDocuments: number;
  filteredDocuments: number;
  isLoading?: boolean;
  className?: string;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

// Sort options configuration
const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "name", label: "Nome" },
  { field: "date", label: "Data" },
  { field: "size", label: "Dimensione" },
  { field: "type", label: "Tipo" },
];

export function DocumentSearchFilter({
  filters,
  onFiltersChange,
  availableCategories,
  availableMimeTypes,
  availableTags,
  sortField,
  sortOrder,
  onSortChange,
  totalDocuments,
  filteredDocuments,
  isLoading = false,
  className,
}: DocumentSearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  // Filter handlers
  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    onFiltersChange({
      search: "",
      categories: [],
      mimeTypes: [],
      tags: [],
      dateRange: {},
      sizeRange: {},
    });
  }, [onFiltersChange]);

  const handleCategoryToggle = useCallback((category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  }, [filters, onFiltersChange]);

  const handleMimeTypeToggle = useCallback((mimeType: string) => {
    const newMimeTypes = filters.mimeTypes.includes(mimeType)
      ? filters.mimeTypes.filter(t => t !== mimeType)
      : [...filters.mimeTypes, mimeType];
    onFiltersChange({ ...filters, mimeTypes: newMimeTypes });
  }, [filters, onFiltersChange]);

  const handleTagToggle = useCallback((tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  }, [filters, onFiltersChange]);

  const handleSortToggle = useCallback((field: SortField) => {
    if (field === sortField) {
      // Toggle order if same field
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    }
    else {
      // Set new field with default order
      onSortChange(field, field === "date" ? "desc" : "asc");
    }
  }, [sortField, sortOrder, onSortChange]);

  // Computed values
  const activeFiltersCount = useMemo(() => {
    return filters.categories.length
      + filters.mimeTypes.length
      + filters.tags.length
      + (filters.search.length > 0 ? 1 : 0);
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={cn("space-y-4 bg-primary-foreground rounded-lg p-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Cerca documenti per nome, descrizione o tag..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="px-10"
          disabled={isLoading}
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
            onClick={() => {
              setSearchInput("");
              searchInputRef.current?.focus();
            }}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Filters and Sort Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(hasActiveFilters && "bg-primary/10 border-primary")}
              >
                <Filter className="size-4" />
                Filtri
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Filtri</CardTitle>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-auto p-1 text-xs"
                      >
                        Pulisci tutto
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Categories */}
                  {availableCategories.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Tag className="size-3" />
                        Categorie
                      </h4>
                      <div className="space-y-2">
                        {availableCategories.map(category => (
                          <div key={category.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.value}`}
                              checked={filters.categories.includes(category.value)}
                              onCheckedChange={() => handleCategoryToggle(category.value)}
                            />
                            <label
                              htmlFor={`category-${category.value}`}
                              className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.label}
                              {category.count !== undefined && (
                                <span className="ml-1 text-muted-foreground">
                                  (
                                  {category.count}
                                  )
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MIME Types */}
                  {availableMimeTypes.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <FileType className="size-3" />
                          Tipi di file
                        </h4>
                        <div className="space-y-2">
                          {availableMimeTypes.map(mimeType => (
                            <div key={mimeType.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mime-${mimeType.value}`}
                                checked={filters.mimeTypes.includes(mimeType.value)}
                                onCheckedChange={() => handleMimeTypeToggle(mimeType.value)}
                              />
                              <label
                                htmlFor={`mime-${mimeType.value}`}
                                className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {mimeType.label}
                                {mimeType.count !== undefined && (
                                  <span className="ml-1 text-muted-foreground">
                                    (
                                    {mimeType.count}
                                    )
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tags */}
                  {availableTags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <Tag className="size-3" />
                          Tag
                        </h4>
                        <div className="max-h-32 space-y-2 overflow-y-auto">
                          {availableTags.map(tag => (
                            <div key={tag.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tag-${tag.value}`}
                                checked={filters.tags.includes(tag.value)}
                                onCheckedChange={() => handleTagToggle(tag.value)}
                              />
                              <label
                                htmlFor={`tag-${tag.value}`}
                                className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {tag.label}
                                {tag.count !== undefined && (
                                  <span className="ml-1 text-muted-foreground">
                                    (
                                    {tag.count}
                                    )
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Ricerca: "
                  {filters.search}
                  "
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-3 p-0 hover:bg-transparent"
                    onClick={() => {
                      setSearchInput("");
                      onFiltersChange({ ...filters, search: "" });
                    }}
                  >
                    <X className="size-2" />
                  </Button>
                </Badge>
              )}
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-3 p-0 hover:bg-transparent"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <X className="size-2" />
                  </Button>
                </Badge>
              ))}
              {filters.mimeTypes.map((mimeType) => {
                const option = availableMimeTypes.find(t => t.value === mimeType);
                return (
                  <Badge key={mimeType} variant="secondary" className="gap-1">
                    {option?.label || mimeType}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-3 p-0 hover:bg-transparent"
                      onClick={() => handleMimeTypeToggle(mimeType)}
                    >
                      <X className="size-2" />
                    </Button>
                  </Badge>
                );
              })}
              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-3 p-0 hover:bg-transparent"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <X className="size-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="size-4" />
                Ordina:
                {" "}
                {SORT_OPTIONS.find(opt => opt.field === sortField)?.label}
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                {SORT_OPTIONS.map(option => (
                  <Button
                    key={option.field}
                    variant={sortField === option.field ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleSortToggle(option.field)}
                  >
                    {option.label}
                    {sortField === option.field && (
                      <span className="ml-auto text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoading ? (
            "Caricamento..."
          ) : filteredDocuments === totalDocuments ? (
            `${totalDocuments} documenti`
          ) : (
            `${filteredDocuments} di ${totalDocuments} documenti`
          )}
        </span>

        {hasActiveFilters && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto p-1 text-xs"
          >
            Pulisci filtri
          </Button>
        )}
      </div>
    </div>
  );
}

export default DocumentSearchFilter;
