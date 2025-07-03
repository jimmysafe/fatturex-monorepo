import type { PutBlobResult } from "@vercel/blob";

import { del, list, put } from "@vercel/blob";

import { env } from "@/env";

/**
 * Generate the storage path for a document based on user ID and year
 * @param userId - The user ID
 * @param anno - The year (anno)
 * @param filename - The original filename
 * @returns The full storage path
 */
export function generateDocumentPath(userId: string, anno: string, filename: string): string {
  // Clean filename to ensure it's safe for storage
  const cleanFilename = filename.replace(/[^a-z0-9.-]/gi, "_");
  return `fatturex/${userId}/documents/${anno}/${cleanFilename}`;
}

/**
 * Generate a unique filename to avoid collisions
 * @param originalFilename - The original filename
 * @returns A unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const extension = originalFilename.split(".").pop();
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "");
  const cleanName = nameWithoutExt.replace(/[^a-z0-9-]/gi, "_");
  return `${cleanName}_${timestamp}.${extension}`;
}

/**
 * Upload a document to Vercel Blob storage
 * @param file - The file to upload
 * @param userId - The user ID
 * @param anno - The year (anno)
 * @returns Promise with the upload result
 */
export async function uploadDocument(
  file: File,
  userId: string,
  anno: string,
): Promise<PutBlobResult> {
  const uniqueFilename = generateUniqueFilename(file.name);
  const storagePath = generateDocumentPath(userId, anno, uniqueFilename);

  const blob = await put(storagePath, file, {
    access: "public", // Documents should be private
    token: env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false, // We're handling uniqueness ourselves
  });

  return blob;
}

/**
 * Delete a document from Vercel Blob storage
 * @param url - The blob URL to delete
 * @returns Promise<void>
 */
export async function deleteDocument(url: string): Promise<void> {
  await del(url, {
    token: env.BLOB_READ_WRITE_TOKEN,
  });
}

/**
 * List documents for a user and year
 * @param userId - The user ID
 * @param anno - The year (anno)
 * @returns Promise with list of blobs
 */
export async function listUserDocuments(userId: string, anno: string) {
  const prefix = `fatturex/${userId}/documents/${anno}/`;

  const { blobs } = await list({
    prefix,
    token: env.BLOB_READ_WRITE_TOKEN,
  });

  return blobs;
}

/**
 * Extract user ID and year from a document storage path
 * @param path - The storage path
 * @returns Object with userId and anno, or null if invalid
 */
export function parseDocumentPath(path: string): { userId: string; anno: string; filename: string } | null {
  const match = path.match(/^documents\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!match)
    return null;

  return {
    userId: match[1],
    anno: match[2],
    filename: match[3],
  };
}

/**
 * Validate if a user can access a document based on the storage path
 * @param path - The document storage path
 * @param userId - The requesting user ID
 * @returns boolean indicating if access is allowed
 */
export function canUserAccessDocument(path: string, userId: string): boolean {
  const parsed = parseDocumentPath(path);
  return parsed?.userId === userId;
}
