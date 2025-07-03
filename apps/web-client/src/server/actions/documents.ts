"use server";

import crypto from "node:crypto";

import {
  bulkDeleteDocuments as bulkDeleteDocumentsQuery,
  createDocument,
  deleteDocument as deleteDocumentQuery,
  getAllDocumentsByYear as getAllDocumentsByYearQuery,
  getDocument as getDocumentQuery,
  getDocuments as getDocumentsQuery,
  getDocumentStats,
  getRecentDocuments as getRecentDocumentsQuery,
  searchDocuments,
  updateDocument as updateDocumentQuery,
} from "@repo/database/queries/documents";
import { ALLOWED_DOCUMENT_TYPES, IMAGE_TYPES, MAX_DOCUMENT_SIZE } from "@repo/shared/const";
import { IdParamSchema, YearParamSchema } from "@repo/shared/params-validators";
import JSZip from "jszip";
import { z } from "zod";
import { ZSAError } from "zsa";

import { env } from "@/env";
import {
  deleteDocument as deleteFromBlob,
  generateUniqueFilename,
  uploadDocument,
} from "@/lib/documents-storage";

import { authProcedure } from "../procedures/authenticated";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const DocumentUploadSchema = z.object({
  files: z.array(z.instanceof(File))
    .min(1, "At least one file is required")
    .max(10, "Maximum 10 files allowed per upload")
    .refine(
      files => files.every(file => file.size <= MAX_DOCUMENT_SIZE),
      `Each file must be smaller than ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
    )
    .refine(
      files => files.every(file => ALLOWED_DOCUMENT_TYPES.includes(file.type as any)),
      "Invalid file type. Only documents, images, and archives are allowed",
    ),
  anno: YearParamSchema.shape.anno,
});

const DocumentListSchema = z.object({
  anno: YearParamSchema.shape.anno,
  page: z.string().optional().default("1"),
  per_page: z.string().optional().default("20"),
  search: z.string().optional(),
  category: z.string().optional(),
  mimeType: z.string().optional(),
});

const DocumentByIdSchema = IdParamSchema;

const DocumentByUrlSchema = z.object({
  url: z.string().url(),
  anno: YearParamSchema.shape.anno,
});

const BulkDocumentOperationSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one document ID is required").max(50, "Maximum 50 documents allowed"),
  anno: YearParamSchema.shape.anno,
});

const BulkDocumentUrlsSchema = z.object({
  urls: z.array(z.string().url()).min(1, "At least one URL is required").max(50, "Maximum 50 documents allowed"),
  anno: YearParamSchema.shape.anno,
});

const DocumentUpdateMetadataSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  displayName: z.string().min(1, "Display name cannot be empty").max(255, "Display name too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty").max(50, "Tag too long")).max(20, "Maximum 20 tags allowed").optional(),
  category: z.string().min(1, "Category cannot be empty").max(50, "Category too long").optional(),
});

const DocumentSearchSchema = z.object({
  query: z.string().min(1),
  anno: YearParamSchema.shape.anno.optional(),
  limit: z.number().min(1).max(50).optional().default(20),
});

const SecureDownloadSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  expirationMinutes: z.number().min(5).max(1440).optional().default(60), // 5 minutes to 24 hours
  downloadType: z.enum(["direct", "secure", "preview"]).optional().default("secure"),
});

const BulkDownloadSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one document ID is required").max(100, "Maximum 100 documents allowed"),
  anno: YearParamSchema.shape.anno,
  zipName: z.string().min(1).max(100).optional(),
  includeMetadata: z.boolean().optional().default(false),
  compressionLevel: z.number().min(0).max(9).optional().default(6),
});

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Centralized validation for document IDs with consistent error handling
 */
function validateDocumentId(id: string, operation: string = "operation"): void {
  if (!id || typeof id !== "string") {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Invalid document ID format for ${operation}`);
  }

  const trimmedId = id.trim();
  if (trimmedId.length === 0) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Document ID cannot be empty for ${operation}`);
  }

  // Validate UUID format (36 characters with hyphens)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(trimmedId)) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Invalid document ID format for ${operation}`);
  }
}

/**
 * Centralized validation for year parameters with consistent error handling
 */
function validateYear(anno: string, operation: string = "operation"): number {
  if (!anno || typeof anno !== "string") {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Invalid year format for ${operation}`);
  }

  const yearNum = Number.parseInt(anno);
  const currentYear = new Date().getFullYear();

  if (Number.isNaN(yearNum)) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Year must be a valid number for ${operation}`);
  }

  if (yearNum < 2000 || yearNum > currentYear + 1) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Year must be between 2000 and ${currentYear + 1} for ${operation}`);
  }

  return yearNum;
}

/**
 * Centralized validation for file uploads with consistent error handling
 */
function validateFileUpload(file: File, maxSize: number = MAX_DOCUMENT_SIZE): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
    };
  }

  // Check filename
  if (!file.name || file.name.trim().length === 0) {
    return {
      valid: false,
      error: "File must have a valid name",
    };
  }

  // Check for potentially dangerous file extensions
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com", ".js", ".vbs", ".jar"];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  if (dangerousExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `File extension '${fileExtension}' is not allowed for security reasons`,
    };
  }

  return { valid: true };
}

/**
 * Centralized validation for pagination parameters
 */
function validatePaginationParams(page?: string, per_page?: string): { page: number; per_page: number } {
  const pageNum = page ? Number.parseInt(page) : 1;
  const perPageNum = per_page ? Number.parseInt(per_page) : 20;

  if (Number.isNaN(pageNum) || pageNum < 1) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Page must be a positive number");
  }

  if (Number.isNaN(perPageNum) || perPageNum < 1 || perPageNum > 1000) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Per page must be between 1 and 1000");
  }

  return { page: pageNum, per_page: perPageNum };
}

/**
 * Centralized validation for bulk operations
 */
function validateBulkOperation(ids: string[], maxCount: number = 50, operation: string = "operation"): void {
  if (!Array.isArray(ids)) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Document IDs must be an array for ${operation}`);
  }

  if (ids.length === 0) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `At least one document ID is required for ${operation}`);
  }

  if (ids.length > maxCount) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Maximum ${maxCount} documents allowed for ${operation}`);
  }

  // Validate each ID
  const invalidIds = ids.filter((id) => {
    try {
      validateDocumentId(id, operation);
      return false;
    }
    catch {
      return true;
    }
  });

  if (invalidIds.length > 0) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Invalid document IDs for ${operation}: ${invalidIds.slice(0, 5).join(", ")}${invalidIds.length > 5 ? "..." : ""}`);
  }

  // Check for duplicates
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Duplicate document IDs are not allowed for ${operation}`);
  }
}

/**
 * Standardized error handling wrapper for async operations
 */
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  fallbackError: string = "Operation failed",
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof ZSAError) {
      throw error;
    }

    console.error(`${context} error:`, error);

    // Handle common database errors
    if (error instanceof Error) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Referenced resource not found or access denied");
      }

      if (error.message.includes("UNIQUE constraint failed")) {
        throw new ZSAError("CONFLICT", "Resource already exists");
      }

      if (error.message.includes("NOT NULL constraint failed")) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Required field is missing");
      }
    }

    throw new ZSAError("INTERNAL_SERVER_ERROR", fallbackError);
  }
}

/**
 * Validate and sanitize search query
 */
function validateSearchQuery(query?: string, minLength: number = 2, maxLength: number = 100): string | undefined {
  if (!query)
    return undefined;

  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0)
    return undefined;

  if (trimmedQuery.length < minLength) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Search query must be at least ${minLength} characters long`);
  }

  if (trimmedQuery.length > maxLength) {
    throw new ZSAError("UNPROCESSABLE_CONTENT", `Search query cannot exceed ${maxLength} characters`);
  }

  // Basic sanitization - remove potentially dangerous characters
  const sanitized = trimmedQuery.replace(/[<>"'&]/g, "");

  return sanitized;
}

/**
 * Validate document ownership and existence
 */
async function validateDocumentOwnership(
  documentId: string,
  userId: string,
  operation: string = "operation",
): Promise<any> {
  validateDocumentId(documentId, operation);

  const document = await getDocumentQuery({ id: documentId, userId });

  if (!document) {
    throw new ZSAError("NOT_FOUND", `Document not found or you don't have permission for ${operation}`);
  }

  return document;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Detect document category based on MIME type
 */
function detectDocumentCategory(mimeType: string): string {
  if (IMAGE_TYPES.includes(mimeType as any)) {
    return "image";
  }
  if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) {
    return "archive";
  }
  return "document";
}

/**
 * Verify user owns a document by URL path
 */
function verifyDocumentOwnership(url: string, userId: string, anno: string): void {
  const pathname = new URL(url).pathname;
  const expectedPrefix = `/fatturex/${userId}/documents/${anno}/`;

  if (!pathname.startsWith(expectedPrefix)) {
    throw new ZSAError("FORBIDDEN", "You can only access your own documents");
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
function getRelativeTime(date: Date | string | number): string {
  const now = new Date();

  // Handle different input types
  let targetDate: Date;
  if (date instanceof Date) {
    targetDate = date;
  }
  else if (typeof date === "string") {
    targetDate = new Date(date);
  }
  else if (typeof date === "number") {
    // SQLite timestamp - could be seconds or milliseconds
    targetDate = new Date(date > 1000000000000 ? date : date * 1000);
  }
  else {
    return "unknown time";
  }

  // Check if date is valid
  if (Number.isNaN(targetDate.getTime())) {
    return "unknown time";
  }

  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60)
    return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;

  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Generate a secure download token with HMAC signing for URL security
 * Uses HMAC-SHA256 for cryptographic security and integrity verification
 */
function generateDownloadToken(documentId: string, userId: string, expiresAt: Date): string {
  // Create payload with document ID, user ID, expiration, and nonce for uniqueness
  const nonce = crypto.randomBytes(8).toString("hex");
  const payload = {
    documentId,
    userId,
    expiresAt: expiresAt.getTime(),
    nonce,
    iat: Date.now(), // issued at time
  };

  // Create signature using HMAC-SHA256
  const secret = env.DOCUMENT_TOKEN_SECRET || "fallback-secret-change-in-production";
  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");

  // Combine payload and signature
  const token = {
    payload: Buffer.from(payloadString).toString("base64url"),
    signature,
  };

  return Buffer.from(JSON.stringify(token)).toString("base64url");
}

/**
 * Verify and decode a download token
 */
function verifyDownloadToken(token: string, documentId: string, userId: string): { valid: boolean; expired: boolean; error?: string } {
  try {
    // Decode token
    const tokenData = JSON.parse(Buffer.from(token, "base64url").toString());
    const { payload: payloadB64, signature } = tokenData;

    if (!payloadB64 || !signature) {
      return { valid: false, expired: false, error: "Invalid token format" };
    }

    // Decode payload
    const payloadString = Buffer.from(payloadB64, "base64url").toString();
    const payload = JSON.parse(payloadString);

    // Verify signature
    const secret = env.DOCUMENT_TOKEN_SECRET || "fallback-secret-change-in-production";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadString)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, expired: false, error: "Invalid token signature" };
    }

    // Check expiration
    const now = Date.now();
    if (now > payload.expiresAt) {
      return { valid: false, expired: true, error: "Token expired" };
    }

    // Verify document and user match
    if (payload.documentId !== documentId || payload.userId !== userId) {
      return { valid: false, expired: false, error: "Token not valid for this document/user" };
    }

    return { valid: true, expired: false };
  }
  catch (error) {
    return { valid: false, expired: false, error: "Token verification failed" };
  }
}

/**
 * Highlight search terms in text for UI display
 */
function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery || !text)
    return text;

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Upload multiple documents with metadata storage and enhanced error handling
 */
export const uploadDocuments = authProcedure
  .createServerAction()
  .input(DocumentUploadSchema)
  .handler(async ({ input: { files, anno }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      // Validate year parameter
      validateYear(anno, "document upload");

      const uploadResults: Array<{
        id?: string;
        originalName: string;
        displayName?: string;
        size: number;
        type: string;
        category?: string;
        url?: string;
        pathname?: string;
        createdAt?: Date;
        success: boolean;
        error?: string;
      }> = [];

      const rollbackData: Array<{ blobUrl?: string; documentId?: string }> = [];
      // Process uploads with individual error handling
      for (const file of files) {
        try {
          // Use centralized file validation
          const validation = validateFileUpload(file);

          if (!validation.valid) {
            uploadResults.push({
              originalName: file.name,
              size: file.size,
              type: file.type,
              success: false,
              error: validation.error!,
            });
            continue;
          }

          // Sanitize filename for storage
          const sanitizedName = file.name.replace(/[^a-z0-9.-]/gi, "_");

          // Upload to Vercel Blob
          const blobResult = await uploadDocument(file, user.id, anno);
          rollbackData.push({ blobUrl: blobResult.url });

          // Generate stored filename (with timestamp for uniqueness)
          const storedName = generateUniqueFilename(sanitizedName);

          // Detect category
          const category = detectDocumentCategory(file.type);

          // Save metadata to database
          const documentData = {
            userId: user.id,
            originalName: file.name,
            storedName,
            displayName: sanitizedName,
            mimeType: file.type,
            size: file.size,
            blobUrl: blobResult.url,
            storagePath: blobResult.pathname,
            anno,
            category,
            tags: null,
          };

          const document = await createDocument(documentData);

          // Track for potential rollback
          rollbackData[rollbackData.length - 1].documentId = document.id;

          uploadResults.push({
            id: document.id,
            originalName: file.name,
            displayName: document.displayName,
            size: file.size,
            type: file.type,
            category: document.category || undefined,
            url: blobResult.url,
            pathname: blobResult.pathname,
            createdAt: document.createdAt,
            success: true,
          });
        }
        catch (fileError) {
          console.error(`Failed to upload file ${file.name}:`, fileError);

          uploadResults.push({
            originalName: file.name,
            size: file.size,
            type: file.type,
            success: false,
            error: fileError instanceof Error ? fileError.message : "Unknown upload error",
          });
        }
      }

      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      // If all uploads failed, throw an error
      if (successfulUploads.length === 0) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "All file uploads failed");
      }

      // Attempt rollback of successful uploads if there were any failures
      const shouldRollback = failedUploads.length > 0 && rollbackData.length > 0;
      if (shouldRollback) {
        await Promise.allSettled(
          rollbackData.map(async (item) => {
            try {
              if (item.documentId) {
                await deleteDocumentQuery({ id: item.documentId, userId: user.id });
              }
              if (item.blobUrl) {
                await deleteFromBlob(item.blobUrl);
              }
            }
            catch (rollbackError) {
              console.error("Rollback error:", rollbackError);
            }
          }),
        );
      }

      const finalResult = {
        success: failedUploads.length === 0,
        uploads: uploadResults,
        summary: {
          total: files.length,
          successful: successfulUploads.length,
          failed: failedUploads.length,
        },
        message: failedUploads.length === 0
          ? `Successfully uploaded ${successfulUploads.length} file(s)`
          : `Uploaded ${successfulUploads.length} file(s), ${failedUploads.length} failed`,
      };

      return finalResult;
    }, "Document upload", "Failed to upload documents");
  });

/**
 * Get paginated list of documents with enhanced metadata and filtering
 */
export const getDocuments = authProcedure
  .createServerAction()
  .input(DocumentListSchema)
  .handler(async ({ input: { anno, page, per_page, search, category, mimeType }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      // Validate inputs using centralized validation
      validateYear(anno, "document listing");
      const paginationParams = validatePaginationParams(page, per_page);
      const sanitizedSearch = validateSearchQuery(search);

      const result = await getDocumentsQuery({
        userId: user.id,
        anno,
        page: paginationParams.page.toString(),
        per_page: paginationParams.per_page.toString(),
        search: sanitizedSearch,
        category,
        mimeType,
      });

      // Enhance documents with additional metadata
      const enhancedDocuments = result.data.map(doc => ({
        ...doc,
        // Parse tags from JSON string
        tags: doc.tags ? (() => {
          try {
            return JSON.parse(doc.tags);
          }
          catch {
            return [];
          }
        })() : [],
        // Add file extension
        fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
        // Add readable file size
        readableSize: formatFileSize(doc.size),
        // Add time since upload
        uploadedAgo: getRelativeTime(doc.createdAt),
        // Add download URL (direct access for now)
        downloadUrl: doc.blobUrl,
        // Add preview availability
        isPreviewable: IMAGE_TYPES.includes(doc.mimeType as any),
      }));

      return {
        documents: enhancedDocuments,
        meta: {
          ...result.meta,
          // Add additional metadata
          filters: {
            search: sanitizedSearch || null,
            category: category || null,
            mimeType: mimeType || null,
          },
          year: anno,
          pagination: paginationParams,
        },
        success: true,
      };
    }, "Document listing", "Failed to retrieve documents");
  });

/**
 * Get a single document by ID with enhanced metadata
 */
export const getDocument = authProcedure
  .createServerAction()
  .input(DocumentByIdSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      // Use centralized validation and ownership check
      const document = await validateDocumentOwnership(id, user.id, "document retrieval");

      // Enhance document with additional metadata
      const enhancedDocument = {
        ...document,
        // Parse tags from JSON string
        tags: document.tags ? (() => {
          try {
            return JSON.parse(document.tags);
          }
          catch {
            return [];
          }
        })() : [],
        // Add file extension
        fileExtension: document.originalName.split(".").pop()?.toLowerCase() || "",
        // Add readable file size
        readableSize: formatFileSize(document.size),
        // Add time since upload
        uploadedAgo: getRelativeTime(document.createdAt),
        // Add preview availability
        isPreviewable: IMAGE_TYPES.includes(document.mimeType as any),
        // Add secure download URL
        downloadUrl: document.blobUrl,
        // Add file metadata
        metadata: {
          isImage: IMAGE_TYPES.includes(document.mimeType as any),
          isArchive: document.mimeType.includes("zip") || document.mimeType.includes("archive"),
          isPdf: document.mimeType === "application/pdf",
          isOfficeDoc: document.mimeType.includes("word")
            || document.mimeType.includes("excel")
            || document.mimeType.includes("powerpoint"),
        },
      };

      return {
        document: enhancedDocument,
        success: true,
      };
    }, "Document retrieval", "Failed to retrieve document");
  });

/**
 * Get document statistics for a user and year
 */
export const getDocumentStatistics = authProcedure
  .createServerAction()
  .input(YearParamSchema)
  .handler(async ({ input: { anno }, ctx: { user } }) => {
    try {
      const stats = await getDocumentStats({ userId: user.id, anno });

      return {
        stats,
        success: true,
      };
    }
    catch (error) {
      console.error("Document stats error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to retrieve document statistics");
    }
  });

/**
 * Search documents by query with enhanced results
 */
export const searchDocumentsByQuery = authProcedure
  .createServerAction()
  .input(DocumentSearchSchema)
  .handler(async ({ input: { query, anno, limit }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      // Use centralized validation
      const sanitizedQuery = validateSearchQuery(query, 2, 100);
      if (!sanitizedQuery) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Valid search query is required");
      }

      if (anno) {
        validateYear(anno, "document search");
      }

      const results = await searchDocuments({
        userId: user.id,
        query: sanitizedQuery,
        anno,
        limit,
      });

      // Enhance search results with additional metadata
      const enhancedResults = results.map(doc => ({
        ...doc,
        // Parse tags from JSON string
        tags: doc.tags ? (() => {
          try {
            return JSON.parse(doc.tags);
          }
          catch {
            return [];
          }
        })() : [],
        // Add file extension
        fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
        // Add readable file size
        readableSize: formatFileSize(doc.size),
        // Add time since upload
        uploadedAgo: getRelativeTime(doc.createdAt),
        // Add preview availability
        isPreviewable: IMAGE_TYPES.includes(doc.mimeType as any),
        // Highlight search matches in filename
        highlightedName: highlightSearchTerms(doc.originalName, sanitizedQuery),
        highlightedDescription: doc.description ? highlightSearchTerms(doc.description, sanitizedQuery) : null,
      }));

      return {
        documents: enhancedResults,
        searchQuery: sanitizedQuery,
        resultCount: enhancedResults.length,
        success: true,
      };
    }, "Document search", "Failed to search documents");
  });

/**
 * Get all documents for a specific year (without pagination)
 */
export const getAllDocumentsByYear = authProcedure
  .createServerAction()
  .input(YearParamSchema)
  .handler(async ({ input: { anno }, ctx: { user } }) => {
    try {
      // Validate year parameter
      const currentYear = new Date().getFullYear();
      const yearNum = Number.parseInt(anno);
      if (Number.isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Invalid year parameter");
      }

      const documents = await getAllDocumentsByYearQuery({ userId: user.id, anno });

      // Enhance documents with metadata
      const enhancedDocuments = documents.map(doc => ({
        ...doc,
        tags: doc.tags ? (() => {
          try {
            return JSON.parse(doc.tags);
          }
          catch {
            return [];
          }
        })() : [],
        fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
        readableSize: formatFileSize(doc.size),
        uploadedAgo: getRelativeTime(doc.createdAt),
        isPreviewable: IMAGE_TYPES.includes(doc.mimeType as any),
      }));

      return {
        documents: enhancedDocuments,
        year: anno,
        totalCount: enhancedDocuments.length,
        totalSize: enhancedDocuments.reduce((sum, doc) => sum + doc.size, 0),
        success: true,
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Get all documents error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to retrieve all documents");
    }
  });

/**
 * Get recent documents across all years
 */
export const getRecentDocuments = authProcedure
  .createServerAction()
  .input(z.object({
    limit: z.number().min(1).max(50).optional().default(10),
  }))
  .handler(async ({ input: { limit }, ctx: { user } }) => {
    try {
      const documents = await getRecentDocumentsQuery({ userId: user.id, limit });

      // Enhance documents with metadata
      const enhancedDocuments = documents.map(doc => ({
        ...doc,
        tags: doc.tags ? (() => {
          try {
            return JSON.parse(doc.tags);
          }
          catch {
            return [];
          }
        })() : [],
        fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
        readableSize: formatFileSize(doc.size),
        uploadedAgo: getRelativeTime(doc.createdAt),
        isPreviewable: IMAGE_TYPES.includes(doc.mimeType as any),
      }));

      return {
        documents: enhancedDocuments,
        count: enhancedDocuments.length,
        success: true,
      };
    }
    catch (error) {
      console.error("Get recent documents error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to retrieve recent documents");
    }
  });

/**
 * Update document metadata with comprehensive validation and change tracking
 */
export const updateDocumentMetadata = authProcedure
  .createServerAction()
  .input(DocumentUpdateMetadataSchema)
  .handler(async ({ input: { id, tags, displayName, description, category }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      // Use centralized validation and ownership check
      const currentDocument = await validateDocumentOwnership(id, user.id, "document metadata update");

      // Validate at least one field is being updated
      const hasUpdates = displayName !== undefined
        || description !== undefined
        || tags !== undefined
        || category !== undefined;

      if (!hasUpdates) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "At least one field must be provided for update");
      }

      // Prepare update data with proper validation
      const updateData: any = {};
      const changeLog: string[] = [];

      // Handle display name update
      if (displayName !== undefined) {
        if (displayName.trim() !== currentDocument.displayName) {
          updateData.displayName = displayName.trim();
          changeLog.push(`Display name: "${currentDocument.displayName}" → "${displayName.trim()}"`);
        }
      }

      // Handle description update
      if (description !== undefined) {
        const newDescription = description.trim() || null;
        const currentDescription = currentDocument.description || null;

        if (newDescription !== currentDescription) {
          updateData.description = newDescription;
          changeLog.push(`Description: ${
            currentDescription ? `"${currentDescription.substring(0, 50)}${currentDescription.length > 50 ? "..." : ""}"` : "none"
          } → ${
            newDescription ? `"${newDescription.substring(0, 50)}${newDescription.length > 50 ? "..." : ""}"` : "none"
          }`);
        }
      }

      // Handle tags update with validation
      if (tags !== undefined) {
        // Validate and sanitize tags
        const sanitizedTags = tags
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

        // Validate tag count
        if (sanitizedTags.length > 20) {
          throw new ZSAError("UNPROCESSABLE_CONTENT", "Maximum 20 tags allowed");
        }

        // Validate individual tag length
        const invalidTags = sanitizedTags.filter(tag => tag.length > 50);
        if (invalidTags.length > 0) {
          throw new ZSAError("UNPROCESSABLE_CONTENT", `Tags too long: ${invalidTags.join(", ")}`);
        }

        const newTagsJson = sanitizedTags.length > 0 ? JSON.stringify(sanitizedTags) : null;
        const currentTagsJson = currentDocument.tags;

        if (newTagsJson !== currentTagsJson) {
          updateData.tags = newTagsJson;

          const currentTags = currentTagsJson ? (() => {
            try {
              return JSON.parse(currentTagsJson);
            }
            catch {
              return [];
            }
          })() : [];

          changeLog.push(`Tags: [${currentTags.join(", ")}] → [${sanitizedTags.join(", ")}]`);
        }
      }

      // Handle category update with validation
      if (category !== undefined) {
        const newCategory = category.trim();

        // Validate category against known categories
        const validCategories = ["document", "image", "archive", "video", "audio", "other"];
        if (!validCategories.includes(newCategory)) {
          console.warn(`Unknown category "${newCategory}" - allowing but consider adding to valid categories`);
        }

        if (newCategory !== currentDocument.category) {
          updateData.category = newCategory;
          changeLog.push(`Category: "${currentDocument.category || "none"}" → "${newCategory}"`);
        }
      }

      // Check if any actual changes were made
      if (Object.keys(updateData).length === 0) {
        return {
          document: {
            ...currentDocument,
            // Parse tags for consistent response format
            tags: currentDocument.tags ? (() => {
              try {
                return JSON.parse(currentDocument.tags);
              }
              catch {
                return [];
              }
            })() : [],
            readableSize: formatFileSize(currentDocument.size),
            fileExtension: currentDocument.originalName.split(".").pop()?.toLowerCase() || "",
            uploadedAgo: getRelativeTime(currentDocument.createdAt),
          },
          success: true,
          message: "No changes detected - document metadata is already up to date",
          changes: [],
        };
      }

      // Perform the update
      const updatedDocument = await updateDocumentQuery({
        id,
        userId: user.id,
        ...updateData,
      });

      if (!updatedDocument) {
        throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to update document - database operation failed");
      }

      // Enhance response with metadata
      const enhancedDocument = {
        ...updatedDocument,
        // Parse tags for consistent response format
        tags: updatedDocument.tags ? (() => {
          try {
            return JSON.parse(updatedDocument.tags);
          }
          catch {
            return [];
          }
        })() : [],
        // Add file extension
        fileExtension: updatedDocument.originalName.split(".").pop()?.toLowerCase() || "",
        // Add readable file size
        readableSize: formatFileSize(updatedDocument.size),
        // Add time since upload
        uploadedAgo: getRelativeTime(updatedDocument.createdAt),
        // Add preview availability
        isPreviewable: IMAGE_TYPES.includes(updatedDocument.mimeType as any),
        // Add metadata for UI
        metadata: {
          isImage: IMAGE_TYPES.includes(updatedDocument.mimeType as any),
          isArchive: updatedDocument.mimeType.includes("zip") || updatedDocument.mimeType.includes("archive"),
          isPdf: updatedDocument.mimeType === "application/pdf",
          isOfficeDoc: updatedDocument.mimeType.includes("word")
            || updatedDocument.mimeType.includes("excel")
            || updatedDocument.mimeType.includes("powerpoint"),
        },
      };

      return {
        document: enhancedDocument,
        success: true,
        message: `Document metadata updated successfully (${changeLog.length} change${changeLog.length === 1 ? "" : "s"})`,
        changes: changeLog,
        updateInfo: {
          updatedAt: new Date(),
          fieldsChanged: Object.keys(updateData),
          changeCount: changeLog.length,
        },
      };
    }, "Document metadata update", "Failed to update document metadata");
  });

/**
 * Delete a single document with enhanced atomicity and error handling
 */
export const deleteDocumentAction = authProcedure
  .createServerAction()
  .input(DocumentByIdSchema)
  .handler(async ({ input: { id }, ctx: { user } }) => {
    try {
      // Validate document ID
      if (!id || typeof id !== "string" || id.trim().length === 0) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Invalid document ID");
      }

      // Get document to verify ownership and get blob URL
      const document = await getDocumentQuery({ id, userId: user.id });

      if (!document) {
        throw new ZSAError("NOT_FOUND", "Document not found or you don't have permission to delete it");
      }

      // Store original state for potential rollback
      const rollbackInfo = {
        documentId: document.id,
        blobUrl: document.blobUrl,
        storageDeleted: false,
        databaseDeleted: false,
      };

      try {
        // Step 1: Delete from storage first (safer order)
        await deleteFromBlob(document.blobUrl);
        rollbackInfo.storageDeleted = true;

        // Step 2: Delete from database
        const deletedDocument = await deleteDocumentQuery({ id, userId: user.id });

        if (!deletedDocument) {
          throw new Error("Database deletion failed - document not found or unauthorized");
        }

        rollbackInfo.databaseDeleted = true;

        return {
          success: true,
          message: "Document deleted successfully",
          document: {
            ...deletedDocument,
            readableSize: formatFileSize(deletedDocument.size),
            fileExtension: deletedDocument.originalName.split(".").pop()?.toLowerCase() || "",
          },
          deletionInfo: {
            deletedAt: new Date(),
            storageDeleted: true,
            databaseDeleted: true,
          },
        };
      }
      catch (deletionError) {
        console.error("Document deletion failed:", deletionError);

        // Attempt rollback if storage was deleted but database deletion failed
        if (rollbackInfo.storageDeleted && !rollbackInfo.databaseDeleted) {
          console.warn("Storage deleted but database deletion failed. Document metadata may be orphaned.");
          // Note: We cannot restore the blob, but we can warn about the inconsistent state
        }

        throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to delete document completely");
      }
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Document deletion error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to delete document");
    }
  });

/**
 * Bulk delete multiple documents with enhanced atomicity and transaction-like behavior
 */
export const bulkDeleteDocuments = authProcedure
  .createServerAction()
  .input(BulkDocumentOperationSchema)
  .handler(async ({ input: { ids, anno }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      // Use centralized validation
      validateYear(anno, "bulk document deletion");
      validateBulkOperation(ids, 50, "bulk document deletion");

      // Get all documents to verify ownership and get blob URLs
      const documents = await Promise.all(
        ids.map(id => getDocumentQuery({ id, userId: user.id })),
      );

      // Filter out null results and validate all documents belong to user
      const validDocuments = documents.filter(doc => doc !== null);
      const notFoundIds = ids.filter((id, index) => documents[index] === null);

      if (validDocuments.length === 0) {
        throw new ZSAError("NOT_FOUND", "No valid documents found or you don't have permission to delete them");
      }

      // Track deletion progress for rollback
      const deletionResults = {
        storageResults: [] as Array<{ id: string; blobUrl: string; success: boolean; error?: string }>,
        databaseResults: [] as Array<{ id: string; success: boolean; error?: string }>,
        successful: [] as Array<any>,
        failed: [] as Array<{ id: string; error: string }>,
      };

      // Phase 1: Delete from storage with detailed tracking

      for (const document of validDocuments) {
        try {
          await deleteFromBlob(document.blobUrl);
          deletionResults.storageResults.push({
            id: document.id,
            blobUrl: document.blobUrl,
            success: true,
          });
        }
        catch (storageError) {
          const errorMessage = storageError instanceof Error ? storageError.message : "Unknown storage error";
          console.error(`Failed to delete blob for document ${document.id}:`, storageError);

          deletionResults.storageResults.push({
            id: document.id,
            blobUrl: document.blobUrl,
            success: false,
            error: errorMessage,
          });

          deletionResults.failed.push({
            id: document.id,
            error: `Storage deletion failed: ${errorMessage}`,
          });
        }
      }

      // Get IDs of documents where storage deletion succeeded
      const storageSuccessIds = deletionResults.storageResults
        .filter(result => result.success)
        .map(result => result.id);

      // Phase 2: Delete from database (only for documents where storage deletion succeeded)
      if (storageSuccessIds.length > 0) {
        try {
          const deletedDocuments = await bulkDeleteDocumentsQuery({
            ids: storageSuccessIds,
            userId: user.id,
          });

          // Track successful database deletions
          deletedDocuments.forEach((doc) => {
            deletionResults.databaseResults.push({
              id: doc.id,
              success: true,
            });

            deletionResults.successful.push({
              ...doc,
              readableSize: formatFileSize(doc.size),
              fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
            });
          });

          // Check for database deletion failures
          const databaseSuccessIds = deletedDocuments.map(doc => doc.id);
          const databaseFailedIds = storageSuccessIds.filter(id => !databaseSuccessIds.includes(id));

          databaseFailedIds.forEach((id) => {
            deletionResults.databaseResults.push({
              id,
              success: false,
              error: "Database deletion failed",
            });

            deletionResults.failed.push({
              id,
              error: "Database deletion failed - document metadata may be orphaned",
            });
          });
        }
        catch (databaseError) {
          console.error("Bulk database deletion failed:", databaseError);

          // All storage-successful documents failed database deletion
          storageSuccessIds.forEach((id) => {
            deletionResults.databaseResults.push({
              id,
              success: false,
              error: "Bulk database deletion failed",
            });

            deletionResults.failed.push({
              id,
              error: "Database deletion failed - document metadata may be orphaned",
            });
          });
        }
      }

      // Add not found documents to failed list
      notFoundIds.forEach((id) => {
        deletionResults.failed.push({
          id,
          error: "Document not found or unauthorized",
        });
      });

      const totalSuccessful = deletionResults.successful.length;
      const totalFailed = deletionResults.failed.length;
      const isCompleteSuccess = totalFailed === 0;

      return {
        success: isCompleteSuccess,
        summary: {
          total: ids.length,
          successful: totalSuccessful,
          failed: totalFailed,
          notFound: notFoundIds.length,
        },
        results: {
          successful: deletionResults.successful,
          failed: deletionResults.failed,
        },
        message: isCompleteSuccess
          ? `Successfully deleted ${totalSuccessful} document(s)`
          : `Deleted ${totalSuccessful} document(s), ${totalFailed} failed`,
        deletionInfo: {
          deletedAt: new Date(),
          storageResults: deletionResults.storageResults,
          databaseResults: deletionResults.databaseResults,
        },
      };
    }, "Bulk document deletion", "Failed to delete documents");
  });

/**
 * Generate secure download URLs for documents with comprehensive security and flexibility
 */
export const getDocumentDownloadUrl = authProcedure
  .createServerAction()
  .input(SecureDownloadSchema)
  .handler(async ({ input: { id, expirationMinutes, downloadType }, ctx: { user } }) => {
    try {
      // Validate document ID format
      if (!id || typeof id !== "string" || id.trim().length === 0) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Invalid document ID format");
      }

      // Get document with ownership verification
      const document = await getDocumentQuery({ id, userId: user.id });

      if (!document) {
        throw new ZSAError("NOT_FOUND", "Document not found or you don't have permission to access it");
      }

      // Verify blob accessibility with timeout
      let blobAccessible = true;
      let blobError: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(document.blobUrl, {
          method: "HEAD",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          blobAccessible = false;
          blobError = `Storage response: ${response.status} ${response.statusText}`;

          if (response.status === 404) {
            throw new ZSAError("NOT_FOUND", "Document file not found in storage");
          }
        }
      }
      catch (fetchError) {
        blobAccessible = false;
        blobError = fetchError instanceof Error ? fetchError.message : "Storage verification failed";

        // Only throw for 404s or critical errors, warn for network issues
        if (fetchError instanceof Error && fetchError.message.includes("404")) {
          throw new ZSAError("NOT_FOUND", "Document file not found in storage");
        }

        console.warn(`Could not verify blob existence for document ${id}:`, fetchError);
      }

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
      const expiresIn = expirationMinutes * 60;

      // Generate different types of download URLs based on downloadType
      let downloadUrls: any = {};

      if (downloadType === "direct" || downloadType === "secure") {
        // Generate secure token
        const downloadToken = generateDownloadToken(document.id, user.id, expiresAt);

        downloadUrls = {
          // Direct blob URL (use with caution - no expiration)
          directUrl: document.blobUrl,

          // Secure URL with token (recommended)
          secureUrl: `${document.blobUrl}?token=${downloadToken}&expires=${expiresAt.getTime()}&user=${user.id}`,

          // Alternative secure URL format for different use cases
          tokenizedUrl: `/api/documents/${document.id}/download?token=${downloadToken}`,

          // Download token for custom implementations
          downloadToken,
        };
      }

      if (downloadType === "preview" && IMAGE_TYPES.includes(document.mimeType as any)) {
        // Generate preview-specific URLs for images
        const previewToken = generateDownloadToken(document.id, user.id, new Date(Date.now() + 300000)); // 5 min for preview

        downloadUrls.previewUrl = `${document.blobUrl}?preview=true&token=${previewToken}`;
        downloadUrls.thumbnailUrl = `${document.blobUrl}?thumbnail=true&token=${previewToken}`;
      }

      // Enhanced document metadata
      const enhancedMetadata = {
        // File type detection
        isImage: IMAGE_TYPES.includes(document.mimeType as any),
        isPdf: document.mimeType === "application/pdf",
        isOfficeDoc: document.mimeType.includes("word")
          || document.mimeType.includes("excel")
          || document.mimeType.includes("powerpoint")
          || document.mimeType.includes("openxmlformats"),
        isArchive: document.mimeType.includes("zip")
          || document.mimeType.includes("archive")
          || document.mimeType.includes("compressed"),
        isText: document.mimeType.includes("text") || document.mimeType.includes("json"),

        // File details
        fileExtension: document.originalName.split(".").pop()?.toLowerCase() || "",
        isPreviewable: IMAGE_TYPES.includes(document.mimeType as any) || document.mimeType === "application/pdf",
        isStreamable: document.mimeType.includes("video") || document.mimeType.includes("audio"),

        // Size categories
        sizeCategory: document.size < 1024 * 1024 ? "small"
          : document.size < 10 * 1024 * 1024 ? "medium" : "large",

        // Security info
        requiresSpecialHandling: document.size > 50 * 1024 * 1024, // Files > 50MB

        // Download recommendations
        recommendedDownloadMethod: document.size > 100 * 1024 * 1024 ? "stream" : "direct",
      };

      // Parse tags for response
      const tags = document.tags ? (() => {
        try {
          return JSON.parse(document.tags);
        }
        catch {
          return [];
        }
      })() : [];

      return {
        // Document information
        document: {
          id: document.id,
          originalName: document.originalName,
          displayName: document.displayName,
          description: document.description,
          mimeType: document.mimeType,
          size: document.size,
          readableSize: formatFileSize(document.size),
          category: document.category,
          tags,
          anno: document.anno,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          uploadedAgo: getRelativeTime(document.createdAt),
        },

        // Download URLs and tokens
        download: downloadUrls,

        // Security and expiration info
        security: {
          downloadType,
          expiresAt,
          expiresIn,
          expirationMinutes,
          tokenGenerated: !!downloadUrls.downloadToken,
          blobAccessible,
          blobError,
        },

        // Enhanced metadata
        metadata: enhancedMetadata,

        // Usage recommendations
        recommendations: {
          useSecureUrl: true,
          cacheHeaders: enhancedMetadata.sizeCategory === "small",
          streamForLargeFiles: document.size > 100 * 1024 * 1024,
          previewAvailable: enhancedMetadata.isPreviewable,
        },

        success: true,
        message: `Secure download URL generated (expires in ${expirationMinutes} minutes)`,
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Secure download URL generation error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to generate secure download URL");
    }
  });

/**
 * Download multiple documents as a comprehensive ZIP archive with enhanced features
 */
export const downloadMultipleDocuments = authProcedure
  .createServerAction()
  .input(BulkDownloadSchema)
  .handler(async ({ input: { ids, anno, zipName, includeMetadata, compressionLevel }, ctx: { user } }) => {
    try {
      // Validate input constraints
      if (ids.length > 100) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Maximum 100 documents allowed for bulk download");
      }

      // Get all documents with ownership verification
      const documentPromises = ids.map(id => getDocumentQuery({ id, userId: user.id }));
      const documents = await Promise.all(documentPromises);

      // Separate valid and invalid documents
      const validDocuments = documents.filter(doc => doc !== null);
      const invalidIds = ids.filter((id, index) => documents[index] === null);

      if (validDocuments.length === 0) {
        throw new ZSAError("NOT_FOUND", "No valid documents found or you don't have permission to access them");
      }

      // Calculate total size and warn for large downloads
      const totalSize = validDocuments.reduce((sum, doc) => sum + doc.size, 0);
      const maxSize = 500 * 1024 * 1024; // 500MB limit

      if (totalSize > maxSize) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", `Total download size (${formatFileSize(totalSize)}) exceeds maximum allowed (${formatFileSize(maxSize)})`);
      }

      // Initialize ZIP with compression settings
      const zip = new JSZip();
      const downloadResults = {
        successful: [] as Array<{ id: string; filename: string; size: number }>,
        failed: [] as Array<{ id: string; filename: string; error: string }>,
      };

      // Process documents with individual error handling
      for (const [index, document] of validDocuments.entries()) {
        try {
          // Fetch document with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout per file

          const response = await fetch(document.blobUrl, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();

          // Generate safe filename with collision handling
          const filename = document.originalName || `document_${index + 1}`;

          // Handle filename collisions by adding number suffix
          let counter = 1;
          let finalFilename = filename;
          while (zip.file(finalFilename)) {
            const ext = filename.includes(".") ? filename.split(".").pop() : "";
            const nameWithoutExt = filename.includes(".") ? filename.substring(0, filename.lastIndexOf(".")) : filename;
            finalFilename = ext ? `${nameWithoutExt}_${counter}.${ext}` : `${filename}_${counter}`;
            counter++;
          }

          // Add file to ZIP with compression
          zip.file(finalFilename, buffer, {
            compression: "DEFLATE",
            compressionOptions: { level: compressionLevel },
          });

          downloadResults.successful.push({
            id: document.id,
            filename: finalFilename,
            size: document.size,
          });
        }
        catch (fetchError) {
          const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown download error";
          console.error(`Failed to add document to ZIP: ${document.originalName}`, fetchError);

          downloadResults.failed.push({
            id: document.id,
            filename: document.originalName,
            error: errorMessage,
          });
        }
      }

      // Add metadata file if requested
      if (includeMetadata && downloadResults.successful.length > 0) {
        const metadata = {
          generatedAt: new Date().toISOString(),
          generatedBy: user.id,
          year: anno,
          totalDocuments: downloadResults.successful.length,
          totalSize: formatFileSize(totalSize),
          compressionLevel,
          documents: downloadResults.successful.map((result) => {
            const doc = validDocuments.find(d => d.id === result.id);
            return doc ? {
              id: doc.id,
              originalName: doc.originalName,
              displayName: doc.displayName,
              filename: result.filename,
              mimeType: doc.mimeType,
              size: doc.size,
              readableSize: formatFileSize(doc.size),
              category: doc.category,
              description: doc.description,
              tags: doc.tags ? (() => {
                try {
                  return JSON.parse(doc.tags);
                }
                catch {
                  return [];
                }
              })() : [],
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
            } : null;
          }).filter(Boolean),
          failed: downloadResults.failed,
        };

        zip.file("_metadata.json", JSON.stringify(metadata, null, 2));
      }

      // Check if any files were successfully added
      if (downloadResults.successful.length === 0) {
        throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to add any documents to the archive");
      }

      // Generate ZIP filename
      const sanitizedZipName = zipName?.replace(/[^a-z0-9.-]/gi, "_") || `documents-${anno}`;
      const finalZipName = `${sanitizedZipName}.zip`;

      // Generate ZIP buffer with progress tracking

      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: compressionLevel },
        streamFiles: true, // Better memory usage for large files
      });

      // Generate secure download information
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration for ZIP
      const downloadToken = generateDownloadToken(`bulk-${anno}-${Date.now()}`, user.id, expiresAt);

      // Return comprehensive response instead of direct blob
      return {
        success: downloadResults.failed.length === 0,
        zipInfo: {
          filename: finalZipName,
          size: zipBuffer.length,
          readableSize: formatFileSize(zipBuffer.length),
          compressionLevel,
          compressionRatio: totalSize > 0 ? `${((totalSize - zipBuffer.length) / totalSize * 100).toFixed(1)}%` : "0%",
        },
        summary: {
          total: ids.length,
          successful: downloadResults.successful.length,
          failed: downloadResults.failed.length,
          invalidIds: invalidIds.length,
          totalOriginalSize: totalSize,
          totalOriginalSizeReadable: formatFileSize(totalSize),
        },
        results: downloadResults,
        download: {
          // Create a data URL for the ZIP (for small files) or provide download info
          zipBuffer: zipBuffer.length < 10 * 1024 * 1024 ? zipBuffer : null, // Only include buffer for files < 10MB
          downloadToken,
          expiresAt,
          expiresIn: 3600,
        },
        metadata: {
          includeMetadata,
          year: anno,
          generatedAt: new Date(),
          invalidIds,
        },
        message: downloadResults.failed.length === 0
          ? `Successfully created archive with ${downloadResults.successful.length} document(s)`
          : `Created archive with ${downloadResults.successful.length} document(s), ${downloadResults.failed.length} failed`,
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Bulk download error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to create document archive");
    }
  });

/**
 * Delete all documents for a specific year with confirmation
 */
export const deleteAllDocumentsByYear = authProcedure
  .createServerAction()
  .input(z.object({
    anno: YearParamSchema.shape.anno,
    confirmationPhrase: z.string().min(1, "Confirmation phrase is required"),
  }))
  .handler(async ({ input: { anno, confirmationPhrase }, ctx: { user } }) => {
    try {
      // Validate confirmation phrase
      const expectedPhrase = `DELETE ALL DOCUMENTS ${anno}`;
      if (confirmationPhrase !== expectedPhrase) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", `Confirmation phrase must be exactly: "${expectedPhrase}"`);
      }

      // Validate year parameter
      const currentYear = new Date().getFullYear();
      const yearNum = Number.parseInt(anno);
      if (Number.isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Invalid year parameter");
      }

      // Get all documents for the year
      const documents = await getAllDocumentsByYearQuery({ userId: user.id, anno });

      if (documents.length === 0) {
        return {
          success: true,
          message: `No documents found for year ${anno}`,
          summary: {
            total: 0,
            successful: 0,
            failed: 0,
          },
        };
      }

      // Use bulk delete for the actual deletion
      const documentIds = documents.map(doc => doc.id);

      // Call the bulk delete query directly since we're already in a server action
      const deletionResults = {
        storageResults: [] as Array<{ id: string; blobUrl: string; success: boolean; error?: string }>,
        successful: [] as Array<any>,
        failed: [] as Array<{ id: string; error: string }>,
      };

      // Delete from storage first
      for (const document of documents) {
        try {
          await deleteFromBlob(document.blobUrl);
          deletionResults.storageResults.push({
            id: document.id,
            blobUrl: document.blobUrl,
            success: true,
          });
        }
        catch (storageError) {
          const errorMessage = storageError instanceof Error ? storageError.message : "Unknown storage error";
          deletionResults.storageResults.push({
            id: document.id,
            blobUrl: document.blobUrl,
            success: false,
            error: errorMessage,
          });
          deletionResults.failed.push({
            id: document.id,
            error: `Storage deletion failed: ${errorMessage}`,
          });
        }
      }

      // Get IDs of documents where storage deletion succeeded
      const storageSuccessIds = deletionResults.storageResults
        .filter(result => result.success)
        .map(result => result.id);

      // Delete from database
      if (storageSuccessIds.length > 0) {
        try {
          const deletedDocuments = await bulkDeleteDocumentsQuery({
            ids: storageSuccessIds,
            userId: user.id,
          });

          deletedDocuments.forEach((doc) => {
            deletionResults.successful.push({
              ...doc,
              readableSize: formatFileSize(doc.size),
              fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
            });
          });
        }
        catch (databaseError) {
          console.error("Database deletion failed:", databaseError);
          storageSuccessIds.forEach((id) => {
            deletionResults.failed.push({
              id,
              error: "Database deletion failed",
            });
          });
        }
      }

      const deleteResult = {
        success: deletionResults.failed.length === 0,
        summary: {
          total: documents.length,
          successful: deletionResults.successful.length,
          failed: deletionResults.failed.length,
        },
      };

      return {
        ...deleteResult,
        message: `Year ${anno} deletion completed: ${deleteResult.summary.successful} documents deleted, ${deleteResult.summary.failed} failed`,
        yearDeleted: anno,
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Delete all documents by year error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to delete all documents for the year");
    }
  });

/**
 * Move documents between years (for organization)
 */
export const moveDocumentsBetweenYears = authProcedure
  .createServerAction()
  .input(z.object({
    documentIds: z.array(z.string()).min(1, "At least one document ID is required").max(20, "Maximum 20 documents can be moved at once"),
    fromYear: YearParamSchema.shape.anno,
    toYear: YearParamSchema.shape.anno,
  }))
  .handler(async ({ input: { documentIds, fromYear, toYear }, ctx: { user } }) => {
    try {
      // Validate years
      const currentYear = new Date().getFullYear();
      const fromYearNum = Number.parseInt(fromYear);
      const toYearNum = Number.parseInt(toYear);

      if (Number.isNaN(fromYearNum) || fromYearNum < 2000 || fromYearNum > currentYear + 1) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Invalid source year parameter");
      }

      if (Number.isNaN(toYearNum) || toYearNum < 2000 || toYearNum > currentYear + 1) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Invalid target year parameter");
      }

      if (fromYear === toYear) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Source and target years cannot be the same");
      }

      // Get all documents to verify ownership and current year
      const documents = await Promise.all(
        documentIds.map(id => getDocumentQuery({ id, userId: user.id })),
      );

      const validDocuments = documents.filter(doc => doc !== null);
      const notFoundIds = documentIds.filter((id, index) => documents[index] === null);

      if (validDocuments.length === 0) {
        throw new ZSAError("NOT_FOUND", "No valid documents found or you don't have permission to move them");
      }

      // Verify all documents are from the source year
      const wrongYearDocs = validDocuments.filter(doc => doc.anno !== fromYear);
      if (wrongYearDocs.length > 0) {
        throw new ZSAError("UNPROCESSABLE_CONTENT", `Some documents are not from year ${fromYear}`);
      }

      // Update documents to new year
      const moveResults = {
        successful: [] as Array<any>,
        failed: [] as Array<{ id: string; error: string }>,
      };

      for (const document of validDocuments) {
        try {
          const updatedDocument = await updateDocumentQuery({
            id: document.id,
            userId: user.id,
            anno: toYear,
          });

          if (updatedDocument) {
            moveResults.successful.push({
              ...updatedDocument,
              readableSize: formatFileSize(updatedDocument.size),
              fileExtension: updatedDocument.originalName.split(".").pop()?.toLowerCase() || "",
            });
          }
          else {
            moveResults.failed.push({
              id: document.id,
              error: "Failed to update document year",
            });
          }
        }
        catch (updateError) {
          console.error(`Failed to move document ${document.id}:`, updateError);
          moveResults.failed.push({
            id: document.id,
            error: updateError instanceof Error ? updateError.message : "Unknown error",
          });
        }
      }

      // Add not found documents to failed list
      notFoundIds.forEach((id) => {
        moveResults.failed.push({
          id,
          error: "Document not found or unauthorized",
        });
      });

      const totalSuccessful = moveResults.successful.length;
      const totalFailed = moveResults.failed.length;

      return {
        success: totalFailed === 0,
        summary: {
          total: documentIds.length,
          successful: totalSuccessful,
          failed: totalFailed,
          notFound: notFoundIds.length,
        },
        results: {
          successful: moveResults.successful,
          failed: moveResults.failed,
        },
        moveInfo: {
          fromYear,
          toYear,
          movedAt: new Date(),
        },
        message: totalFailed === 0
          ? `Successfully moved ${totalSuccessful} document(s) from ${fromYear} to ${toYear}`
          : `Moved ${totalSuccessful} document(s), ${totalFailed} failed`,
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Move documents error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to move documents between years");
    }
  });

/**
 * Validate a download token and provide secure streaming download
 */
export const validateDownloadToken = authProcedure
  .createServerAction()
  .input(z.object({
    token: z.string().min(1, "Download token is required"),
    documentId: z.string().min(1, "Document ID is required"),
  }))
  .handler(async ({ input: { token, documentId }, ctx: { user } }) => {
    try {
      // Verify the download token
      const tokenValidation = verifyDownloadToken(token, documentId, user.id);

      if (!tokenValidation.valid) {
        if (tokenValidation.expired) {
          throw new ZSAError("NOT_AUTHORIZED", "Download token has expired");
        }
        throw new ZSAError("NOT_AUTHORIZED", tokenValidation.error || "Invalid download token");
      }

      // Get document to verify it still exists and user has access
      const document = await getDocumentQuery({ id: documentId, userId: user.id });

      if (!document) {
        throw new ZSAError("NOT_FOUND", "Document not found or access denied");
      }

      // Verify blob still exists
      try {
        const response = await fetch(document.blobUrl, { method: "HEAD" });
        if (!response.ok) {
          throw new ZSAError("NOT_FOUND", "Document file not found in storage");
        }
      }
      catch (fetchError) {
        throw new ZSAError("NOT_FOUND", "Document file not accessible");
      }

      return {
        valid: true,
        document: {
          id: document.id,
          originalName: document.originalName,
          displayName: document.displayName,
          mimeType: document.mimeType,
          size: document.size,
          readableSize: formatFileSize(document.size),
          blobUrl: document.blobUrl,
        },
        download: {
          authorized: true,
          directUrl: document.blobUrl,
          filename: document.originalName,
          contentType: document.mimeType,
          contentLength: document.size,
        },
        security: {
          tokenValid: true,
          tokenExpired: false,
          accessGranted: new Date(),
        },
        success: true,
        message: "Download authorized",
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Token validation error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to validate download token");
    }
  });

/**
 * Stream a document download with range support for large files
 */
export const streamDocumentDownload = authProcedure
  .createServerAction()
  .input(z.object({
    id: z.string().min(1, "Document ID is required"),
    token: z.string().min(1, "Download token is required").optional(),
    range: z.string().optional(), // HTTP Range header value
  }))
  .handler(async ({ input: { id, token, range }, ctx: { user } }) => {
    try {
      // Verify document access
      const document = await getDocumentQuery({ id, userId: user.id });

      if (!document) {
        throw new ZSAError("NOT_FOUND", "Document not found or access denied");
      }

      // Validate token if provided
      if (token) {
        const tokenValidation = verifyDownloadToken(token, id, user.id);
        if (!tokenValidation.valid) {
          throw new ZSAError("NOT_AUTHORIZED", tokenValidation.error || "Invalid download token");
        }
      }

      // Prepare headers for streaming download
      const headers: Record<string, string> = {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      };

      // Handle range requests for large files
      if (range && document.size > 1024 * 1024) { // Only for files > 1MB
        const parts = range.replace(/bytes=/, "").split("-");
        const start = Number.parseInt(parts[0], 10);
        const end = parts[1] ? Number.parseInt(parts[1], 10) : document.size - 1;

        if (start >= 0 && end < document.size && start <= end) {
          headers["Content-Range"] = `bytes ${start}-${end}/${document.size}`;
          headers["Content-Length"] = (end - start + 1).toString();
          headers["Accept-Ranges"] = "bytes";

          // For range requests, we would need to implement partial content streaming
          // This is a simplified response indicating range support
          return {
            success: true,
            stream: true,
            rangeRequest: true,
            range: { start, end, total: document.size },
            headers,
            downloadUrl: document.blobUrl,
            message: "Partial content streaming prepared",
          };
        }
      }

      // Standard download response
      headers["Content-Length"] = document.size.toString();

      return {
        success: true,
        stream: true,
        rangeRequest: false,
        headers,
        downloadUrl: document.blobUrl,
        document: {
          id: document.id,
          filename: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          readableSize: formatFileSize(document.size),
        },
        message: "Document streaming prepared",
      };
    }
    catch (error) {
      if (error instanceof ZSAError) {
        throw error;
      }
      console.error("Stream download error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to prepare document stream");
    }
  });

// =============================================================================
// VALIDATION MONITORING & REPORTING
// =============================================================================

/**
 * Comprehensive validation report for debugging and monitoring
 */
export const getValidationReport = authProcedure
  .createServerAction()
  .input(z.object({
    includeStats: z.boolean().optional().default(true),
    includeExamples: z.boolean().optional().default(false),
  }))
  .handler(async ({ input: { includeStats, includeExamples }, ctx: { user } }) => {
    return withErrorHandling(async () => {
      const report = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        validationRules: {
          documentId: {
            format: "UUID v4 format (36 characters with hyphens)",
            regex: "/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i",
            example: includeExamples ? "550e8400-e29b-41d4-a716-446655440000" : undefined,
          },
          year: {
            range: "2000 to current year + 1",
            currentMax: new Date().getFullYear() + 1,
            example: includeExamples ? "2024" : undefined,
          },
          fileUpload: {
            maxSize: `${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
            allowedTypes: ALLOWED_DOCUMENT_TYPES.length,
            dangerousExtensions: [".exe", ".bat", ".cmd", ".scr", ".pif", ".com", ".js", ".vbs", ".jar"],
            example: includeExamples ? { name: "document.pdf", size: 1024000, type: "application/pdf" } : undefined,
          },
          pagination: {
            pageMin: 1,
            perPageMax: 100,
            example: includeExamples ? { page: 1, per_page: 20 } : undefined,
          },
          bulkOperations: {
            defaultMaxItems: 50,
            downloadMaxItems: 100,
            example: includeExamples ? ["id1", "id2", "id3"] : undefined,
          },
          searchQuery: {
            minLength: 2,
            maxLength: 100,
            sanitization: "Removes dangerous characters: < > \" ' &",
            example: includeExamples ? "search term" : undefined,
          },
          tags: {
            maxCount: 20,
            maxTagLength: 50,
            example: includeExamples ? ["document", "important", "2024"] : undefined,
          },
        },
        errorHandling: {
          categories: [
            "UNPROCESSABLE_CONTENT - Invalid input data",
            "NOT_FOUND - Resource not found or unauthorized",
            "CONFLICT - Resource already exists",
            "NOT_AUTHORIZED - Authentication/authorization failure",
            "INTERNAL_SERVER_ERROR - System error",
          ],
          databaseErrors: {
            foreignKey: "Referenced resource not found or access denied",
            unique: "Resource already exists",
            notNull: "Required field is missing",
          },
        },
        securityFeatures: {
          ownershipValidation: "All operations verify document ownership",
          inputSanitization: "Search queries and filenames are sanitized",
          fileTypeValidation: "Only allowed file types are accepted",
          sizeValidation: "File size limits enforced",
          tokenSecurity: "HMAC-SHA256 signed download tokens",
          rollbackSupport: "Atomic operations with rollback on failure",
        },
      };

      if (includeStats) {
        // Add some basic statistics if requested
        try {
          const stats = await getDocumentStats({ userId: user.id, anno: new Date().getFullYear().toString() });
          (report as any).userStats = {
            totalDocuments: stats.total.count,
            totalSize: stats.total.size,
            readableTotalSize: formatFileSize(stats.total.size),
            averageFileSize: stats.total.count > 0 ? Math.round(stats.total.size / stats.total.count) : 0,
            categoriesCount: stats.byCategory?.length || 0,
          };
        }
        catch (error) {
          console.warn("Could not fetch user stats for validation report:", error);
        }
      }

      return {
        success: true,
        report,
        message: "Validation report generated successfully",
      };
    }, "Validation report generation", "Failed to generate validation report");
  });

/**
 * Get document deletion candidates (large files, old files, etc.)
 */
export const getDocumentDeletionCandidates = authProcedure
  .createServerAction()
  .input(z.object({
    anno: YearParamSchema.shape.anno,
    criteria: z.enum(["large_files", "old_files", "duplicate_names", "all"]).default("all"),
    limit: z.number().min(1).max(100).optional().default(50),
  }))
  .handler(async ({ input: { anno, criteria, limit }, ctx: { user } }) => {
    try {
      // Get all documents for the year
      const documents = await getAllDocumentsByYearQuery({ userId: user.id, anno });

      if (documents.length === 0) {
        return {
          candidates: [],
          summary: { total: 0, totalSize: 0 },
          criteria,
          success: true,
        };
      }

      const candidates = documents.map(doc => ({
        ...doc,
        tags: doc.tags ? (() => {
          try {
            return JSON.parse(doc.tags);
          }
          catch {
            return [];
          }
        })() : [],
        fileExtension: doc.originalName.split(".").pop()?.toLowerCase() || "",
        readableSize: formatFileSize(doc.size),
        uploadedAgo: getRelativeTime(doc.createdAt),
        isPreviewable: IMAGE_TYPES.includes(doc.mimeType as any),
        // Add scoring for deletion priority
        deletionScore: 0,
        reasons: [] as string[],
      }));

      // Apply criteria-based filtering and scoring
      if (criteria === "large_files" || criteria === "all") {
        const sizeThreshold = 5 * 1024 * 1024; // 5MB
        candidates.forEach((doc) => {
          if (doc.size > sizeThreshold) {
            doc.deletionScore += 3;
            doc.reasons.push(`Large file (${formatFileSize(doc.size)})`);
          }
        });
      }

      if (criteria === "old_files" || criteria === "all") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        candidates.forEach((doc) => {
          if (doc.createdAt < sixMonthsAgo) {
            doc.deletionScore += 2;
            doc.reasons.push(`Old file (${getRelativeTime(doc.createdAt)})`);
          }
        });
      }

      if (criteria === "duplicate_names" || criteria === "all") {
        const nameGroups = candidates.reduce((groups, doc) => {
          const key = doc.originalName.toLowerCase();
          if (!groups[key])
            groups[key] = [];
          groups[key].push(doc);
          return groups;
        }, {} as Record<string, typeof candidates>);

        Object.values(nameGroups).forEach((group) => {
          if (group.length > 1) {
            // Keep the most recent, mark others as duplicates
            group.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            group.slice(1).forEach((doc) => {
              doc.deletionScore += 4;
              doc.reasons.push(`Duplicate name (${group.length} files with same name)`);
            });
          }
        });
      }

      // Filter to only include candidates with reasons and sort by score
      const filteredCandidates = candidates
        .filter(doc => doc.reasons.length > 0)
        .sort((a, b) => b.deletionScore - a.deletionScore)
        .slice(0, limit);

      const totalSize = filteredCandidates.reduce((sum, doc) => sum + doc.size, 0);

      return {
        candidates: filteredCandidates,
        summary: {
          total: filteredCandidates.length,
          totalSize,
          potentialSavings: formatFileSize(totalSize),
        },
        criteria,
        year: anno,
        success: true,
      };
    }
    catch (error) {
      console.error("Get deletion candidates error:", error);
      throw new ZSAError("INTERNAL_SERVER_ERROR", "Failed to get document deletion candidates");
    }
  });
