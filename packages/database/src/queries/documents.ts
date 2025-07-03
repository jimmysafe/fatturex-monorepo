import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { DocumentCreateDto, DocumentFilterSchema, DocumentUpdateDto } from "@repo/database/schema";
import type { YearParamSchema } from "@repo/shared/params-validators";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { getMeta } from "@repo/database/pagination/get-meta";
import { document } from "@repo/database/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";

// Types for query arguments
type GetDocumentsArgs = z.infer<typeof PaginationParamsSchema> &
  z.infer<typeof DocumentFilterSchema> &
  z.infer<typeof YearParamSchema> &
  { userId: string };

interface GetDocumentArgs { id: string; userId: string }
type CreateDocumentArgs = DocumentCreateDto & { userId: string };
type UpdateDocumentArgs = { id: string; userId: string } & Partial<DocumentUpdateDto>;
interface DeleteDocumentArgs { id: string; userId: string }

/**
 * Get paginated list of documents for a user and year with optional filtering
 */
export async function getDocuments({ userId, anno, ...input }: GetDocumentsArgs) {
  const { page, per_page, sort, ...filterParams } = input;

  // Simple where clause for user and year
  const where = and(
    eq(document.userId, userId),
    eq(document.anno, anno),
  );

  // Get pagination metadata
  const meta = await getMeta(document, where, {
    page,
    per_page,
    sort,
  });

  // Fetch paginated data
  const data = await db
    .select()
    .from(document)
    .where(where)
    .orderBy(desc(document.createdAt))
    .limit(meta.data.perPage)
    .offset(meta.skip);

  return { data, meta: meta.data };
}

/**
 * Get all documents for a user and year (without pagination)
 */
export async function getAllDocumentsByYear({ userId, anno }: { userId: string; anno: string }) {
  const data = await db
    .select()
    .from(document)
    .where(and(
      eq(document.userId, userId),
      eq(document.anno, anno),
    ))
    .orderBy(desc(document.createdAt));

  return data;
}

/**
 * Get a single document by ID with user authorization
 */
export async function getDocument({ id, userId }: GetDocumentArgs) {
  const where = and(eq(document.id, id), eq(document.userId, userId));
  const [data] = await db.select().from(document).where(where);

  if (!data) {
    return null;
  }

  return data;
}

/**
 * Get a document by blob URL with user authorization
 */
export async function getDocumentByUrl({ blobUrl, userId }: { blobUrl: string; userId: string }) {
  const where = and(eq(document.blobUrl, blobUrl), eq(document.userId, userId));
  const [data] = await db.select().from(document).where(where);

  if (!data) {
    return null;
  }

  return data;
}

/**
 * Create a new document record
 */
export async function createDocument(data: CreateDocumentArgs) {
  const { userId, ...documentData } = data;

  const [newDocument] = await db
    .insert(document)
    .values({
      userId,
      originalName: documentData.originalName,
      storedName: documentData.storedName,
      displayName: documentData.displayName,
      mimeType: documentData.mimeType,
      size: documentData.size,
      blobUrl: documentData.blobUrl,
      storagePath: documentData.storagePath,
      anno: documentData.anno,
      category: documentData.category || "document",
      description: documentData.description,
      tags: documentData.tags,
      checksum: documentData.checksum,
    })
    .returning();

  return newDocument;
}

/**
 * Update document metadata
 */
export async function updateDocument({ id, userId, ...updates }: UpdateDocumentArgs) {
  // First verify the document exists and belongs to the user
  const existingDocument = await getDocument({ id, userId });
  if (!existingDocument) {
    return null;
  }

  const [updatedDocument] = await db
    .update(document)
    .set({
      ...updates,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(and(eq(document.id, id), eq(document.userId, userId)))
    .returning();

  return updatedDocument;
}

/**
 * Delete a document record
 */
export async function deleteDocument({ id, userId }: DeleteDocumentArgs) {
  // First verify the document exists and belongs to the user
  const existingDocument = await getDocument({ id, userId });
  if (!existingDocument) {
    return null;
  }

  const [deletedDocument] = await db
    .delete(document)
    .where(and(eq(document.id, id), eq(document.userId, userId)))
    .returning();

  return deletedDocument;
}

/**
 * Bulk delete multiple documents
 */
export async function bulkDeleteDocuments({ ids, userId }: { ids: string[]; userId: string }) {
  if (ids.length === 0) {
    return [];
  }

  // Verify all documents belong to the user before deletion
  const existingDocuments = await db
    .select({ id: document.id })
    .from(document)
    .where(and(
      sql`${document.id} IN ${ids}`,
      eq(document.userId, userId),
    ));

  if (existingDocuments.length !== ids.length) {
    throw new Error("Some documents do not exist or do not belong to the user");
  }

  const deletedDocuments = await db
    .delete(document)
    .where(and(
      sql`${document.id} IN ${ids}`,
      eq(document.userId, userId),
    ))
    .returning();

  return deletedDocuments;
}

/**
 * Get document statistics for a user and year
 */
export async function getDocumentStats({ userId, anno }: { userId: string; anno: string }) {
  const [stats] = await db
    .select({
      totalCount: count(),
      totalSize: sql<number>`sum(${document.size})`,
    })
    .from(document)
    .where(and(
      eq(document.userId, userId),
      eq(document.anno, anno),
    ));

  // Get count by category
  const categoryStats = await db
    .select({
      category: document.category,
      count: count(),
      totalSize: sql<number>`sum(${document.size})`,
    })
    .from(document)
    .where(and(
      eq(document.userId, userId),
      eq(document.anno, anno),
    ))
    .groupBy(document.category);

  return {
    total: {
      count: stats?.totalCount || 0,
      size: stats?.totalSize || 0,
    },
    byCategory: categoryStats,
  };
}

/**
 * Search documents by text across multiple fields
 */
export async function searchDocuments({
  userId,
  query,
  anno,
  limit = 20,
}: {
  userId: string;
  query: string;
  anno?: string;
  limit?: number;
}) {
  const searchConditions = [
    sql`${document.originalName} LIKE ${`%${query}%`}`,
    sql`${document.displayName} LIKE ${`%${query}%`}`,
    sql`${document.description} LIKE ${`%${query}%`}`,
  ];

  const whereConditions = [
    eq(document.userId, userId),
    sql.join(searchConditions, " OR "),
  ];

  if (anno) {
    whereConditions.push(eq(document.anno, anno));
  }

  const data = await db
    .select()
    .from(document)
    .where(and(...whereConditions))
    .orderBy(desc(document.createdAt))
    .limit(limit);

  return data;
}

/**
 * Get recent documents for a user (across all years)
 */
export async function getRecentDocuments({ userId, limit = 10 }: { userId: string; limit?: number }) {
  const data = await db
    .select()
    .from(document)
    .where(eq(document.userId, userId))
    .orderBy(desc(document.createdAt))
    .limit(limit);

  return data;
}

/**
 * Get years that have documents for a user
 */
export async function getDocumentYears({ userId }: { userId: string }) {
  const data = await db
    .select({
      anno: document.anno,
      count: count(),
    })
    .from(document)
    .where(eq(document.userId, userId))
    .groupBy(document.anno)
    .orderBy(desc(document.anno));

  return data;
}

/**
 * Check if a user has any documents
 */
export async function hasDocuments({ userId }: { userId: string }) {
  const [result] = await db
    .select({ count: count() })
    .from(document)
    .where(eq(document.userId, userId));

  return (result?.count || 0) > 0;
}

/**
 * Get documents by storage path pattern (for cleanup operations)
 */
export async function getDocumentsByStoragePath({
  userId,
  pathPattern,
}: {
  userId: string;
  pathPattern: string;
}) {
  const data = await db
    .select()
    .from(document)
    .where(and(
      eq(document.userId, userId),
      sql`${document.storagePath} LIKE ${pathPattern}`,
    ));

  return data;
}
