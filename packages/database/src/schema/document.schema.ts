import { user } from "@repo/database/schemas/auth.schema";
import { ALLOWED_DOCUMENT_TYPES } from "@repo/shared/const";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";
import { z } from "zod";

export const document = sqliteTable("documents", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  // Document identification
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(),
  displayName: text("display_name").notNull(),

  // File metadata
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // Size in bytes

  // Storage information
  blobUrl: text("blob_url").notNull().unique(),
  storagePath: text("storage_path").notNull(), // documents/{userId}/{anno}/{filename}

  // Organization
  anno: text("anno", { length: 4 }).notNull(), // Year for organization
  category: text("category").default("document"), // document, image, archive, etc.

  // Optional metadata
  description: text("description"),
  tags: text("tags"), // JSON string array for future search functionality

  // File integrity (for future use)
  checksum: text("checksum"), // SHA-256 hash for integrity verification

  // User relationship
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

// Relations
export const documentsRelations = relations(document, ({ one }) => ({
  user: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
}));

// Zod schemas for validation
export const DocumentSchema = createSelectSchema(document, {
  mimeType: z.enum(ALLOWED_DOCUMENT_TYPES as any),
  anno: z.string().length(4).regex(/^\d{4}$/, "Anno must be a 4-digit year"),
  size: z.number().positive("File size must be positive"),
  tags: z.string().optional().transform((val) => {
    if (!val)
      return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    }
    catch {
      return [];
    }
  }),
});

export const CreateDocumentSchema = createInsertSchema(document, {
  mimeType: z.enum(ALLOWED_DOCUMENT_TYPES as any),
  anno: z.string().length(4).regex(/^\d{4}$/, "Anno must be a 4-digit year"),
  size: z.number().positive("File size must be positive").max(10 * 1024 * 1024, "File size cannot exceed 10MB"),
  originalName: z.string().min(1, "Original name is required").max(255, "Original name too long"),
  storedName: z.string().min(1, "Stored name is required").max(255, "Stored name too long"),
  displayName: z.string().min(1, "Display name is required").max(255, "Display name too long"),
  blobUrl: z.string().url("Invalid blob URL"),
  storagePath: z.string().min(1, "Storage path is required"),
  category: z.string().optional().default("document"),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.array(z.string()).optional().transform((val) => {
    return val ? JSON.stringify(val) : null;
  }),
  checksum: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const UpdateDocumentSchema = CreateDocumentSchema.partial().extend({
  displayName: z.string().min(1, "Display name is required").max(255, "Display name too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.array(z.string()).optional().transform((val) => {
    return val ? JSON.stringify(val) : null;
  }),
});

// Filter schema for document queries
export const DocumentFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  mimeType: z.enum(ALLOWED_DOCUMENT_TYPES as any).optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

// Type exports
export type Document = z.infer<typeof DocumentSchema>;
export type DocumentCreateDto = z.infer<typeof CreateDocumentSchema>;
export type DocumentUpdateDto = z.infer<typeof UpdateDocumentSchema>;
export type DocumentFilter = z.infer<typeof DocumentFilterSchema>;

// Helper types for document operations
export type DocumentWithoutUserData = Omit<Document, "userId">;
export type DocumentMetadata = Pick<Document, "id" | "originalName" | "displayName" | "mimeType" | "size" | "category" | "createdAt" | "blobUrl" | "description" | "tags">;
