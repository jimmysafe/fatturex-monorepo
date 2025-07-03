"use client";

import React, { useState } from "react";

import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  FileText,
  Image,
  Info,
  Upload,
} from "lucide-react";

import { DocumentUpload } from "./document-upload";
import { DocumentUploadModal } from "./document-upload-modal";

export function DocumentUploadDemo() {
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadComplete = (results: any) => {
    setUploadResults(results);
  };

  const supportedTypes = [
    {
      icon: <FileText className="size-5 text-red-500" />,
      label: "PDF Documents",
      types: ["application/pdf"],
    },
    {
      icon: <Image className="size-5 text-blue-500" />,
      label: "Images",
      types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    },
    {
      icon: <FileText className="size-5 text-green-500" />,
      label: "Office Documents",
      types: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"],
    },
    {
      icon: <Archive className="size-5 text-orange-500" />,
      label: "Archives",
      types: ["application/zip", "application/x-rar-compressed"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Document Upload Component Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This demo showcases the Document Upload component with drag-and-drop functionality,
            file validation, upload progress tracking, and integration with the server actions.
          </p>

          <div className="flex gap-2">
            <DocumentUploadModal
              trigger={(
                <Button variant="outline">
                  <Upload className="mr-2 size-4" />
                  Try Modal Upload
                </Button>
              )}
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
            />

            <Button
              variant="outline"
              onClick={() => setUploadResults(null)}
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Supported File Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {supportedTypes.map(type => (
              <div key={type.label} className="flex items-center gap-3 rounded-lg border p-3">
                {type.icon}
                <div>
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {type.types.length}
                    {" "}
                    format
                    {type.types.length > 1 ? "s" : ""}
                    {" "}
                    supported
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              <strong>File Limits:</strong>
              {" "}
              Maximum 10MB per file, up to 10 files per upload.
              Dangerous file extensions (.exe, .bat, .js, etc.) are automatically blocked for security.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Inline Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inline Upload Component</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            maxFiles={5}
            className="max-w-2xl"
          />
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResults.success ? (
                <CheckCircle className="size-5 text-green-500" />
              ) : (
                <AlertCircle className="size-5 text-orange-500" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <Badge variant={uploadResults.success ? "default" : "secondary"}>
                {uploadResults.success ? "Complete" : "Partial"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {uploadResults.message}
              </span>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-2xl font-bold">{uploadResults.summary.total}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{uploadResults.summary.successful}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">{uploadResults.summary.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {/* Detailed Results */}
            {uploadResults.uploads && uploadResults.uploads.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">File Details:</h4>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {uploadResults.uploads.map((upload: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        upload.success ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-red-200 bg-red-50 dark:bg-red-950"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {upload.success ? (
                          <CheckCircle className="size-4 text-green-500" />
                        ) : (
                          <AlertCircle className="size-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{upload.originalName}</p>
                          {upload.error && (
                            <p className="text-xs text-red-600">{upload.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {(upload.size / 1024 / 1024).toFixed(2)}
                          {" "}
                          MB
                        </p>
                        {upload.category && (
                          <Badge variant="outline" className="text-xs">
                            {upload.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data (for development) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                View Raw Response Data
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(uploadResults, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Component Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Upload Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Drag and drop file upload</li>
                <li>• Click to select files fallback</li>
                <li>• Multiple file selection</li>
                <li>• Real-time file validation</li>
                <li>• Image preview generation</li>
                <li>• Upload progress tracking</li>
                <li>• Individual file status tracking</li>
                <li>• Error handling with retry</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Experience</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Visual drag-over feedback</li>
                <li>• File type icons and previews</li>
                <li>• Clear validation messages</li>
                <li>• Bulk actions (clear all, upload)</li>
                <li>• Success/error notifications</li>
                <li>• Auto-cleanup of successful uploads</li>
                <li>• Responsive design</li>
                <li>• Accessibility support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
