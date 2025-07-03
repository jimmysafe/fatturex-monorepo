"use client";

import React from "react";

import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { BarChart3, FileText } from "lucide-react";

import type { Document } from "./types";

interface DocumentStatisticsCardsProps {
  statistics: any;
  allDocuments: Document[];
  filteredDocuments: Document[];
  selectedCount: number;
  viewMode: "grid" | "list";
}

export function DocumentStatisticsCards({
  statistics,
  allDocuments,
  filteredDocuments,
  selectedCount,
  viewMode,
}: DocumentStatisticsCardsProps) {
  // Calculate fallback values if statistics are not available
  const totalDocuments = statistics?.totalDocuments || allDocuments.length;
  const totalSize = statistics?.readableTotalSize || `${Math.round((allDocuments.reduce((sum, doc) => sum + doc.size, 0)) / 1024 / 1024)} MB`;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4" />
            Totale Documenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDocuments}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="size-4" />
            Dimensione Totale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSize}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Filtrati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredDocuments.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Selezionati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{selectedCount}</div>
          <Badge variant="secondary" className="mt-1">
            {viewMode === "grid" ? "Griglia" : "Lista"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
