# @repo/database

Database package for the FattureX monorepo, providing schema definitions, query functions, and database utilities using Drizzle ORM with Turso (LibSQL).

## Overview

This package contains:

- **Database Schema**: Drizzle ORM schema definitions for all tables
- **Query Functions**: TypeScript functions for database operations
- **Migrations**: Database migration files and utilities
- **Types**: TypeScript type definitions and Zod schemas
- **Utilities**: Database connection and helper functions

## Quick Start

### Installation & Setup

The database package is already configured for the monorepo. To use it in your app:

```typescript
import { db } from "@repo/database/client";
import { getDocuments } from "@repo/database/queries/documents";
import { document, user } from "@repo/database/schema";
```

### Environment Variables

Configure the following environment variables:

```env
DATABASE_URL=libsql://your-database-url
DATABASE_AUTH_TOKEN=your-auth-token
```

### Running Migrations

```bash
# Generate new migration
npm run generate

# Apply migrations
npm run migrate

# Open Drizzle Studio
npm run studio
```

## Package Structure

```
packages/database/
├── src/
│   ├── client.ts              # Database connection
│   ├── schema/
│   │   ├── index.ts           # Schema exports
│   │   ├── auth.schema.ts     # Authentication tables
│   │   ├── document.schema.ts # Document metadata tables
│   │   ├── cliente.schema.ts  # Client tables
│   │   └── ...                # Other schema files
│   ├── queries/
│   │   ├── documents.ts       # Document query functions
│   │   ├── clienti.ts         # Client query functions
│   │   └── ...                # Other query modules
│   ├── migrations/            # Database migration files
│   └── lib/                   # Utilities and helpers
├── DOCUMENTS.md               # Document schema documentation
├── drizzle.config.ts          # Drizzle configuration
└── package.json
```

## Available Schemas

### Core Schemas

- **auth.schema.ts**: User authentication and sessions
- **cliente.schema.ts**: Client management
- **fattura.schema.ts**: Invoice system
- **contabilita.schema.ts**: Accounting data

### Document System

- **document.schema.ts**: Document metadata and storage references

For detailed documentation on the document system, see [DOCUMENTS.md](./DOCUMENTS.md).

## Query Functions

Each schema has corresponding query functions that provide:

- **Type Safety**: Full TypeScript support
- **Authorization**: User-based access control
- **Validation**: Input validation with Zod schemas
- **Pagination**: Built-in pagination support
- **Search**: Full-text search capabilities

### Example Usage

```typescript
import { createDocument, getDocuments } from "@repo/database/queries/documents";

// Get paginated documents
const result = await getDocuments({
  userId: "user-123",
  anno: "2024",
  page: "1",
  per_page: "20",
  search: "contract"
});

// Create new document
const document = await createDocument({
  userId: "user-123",
  originalName: "contract.pdf",
  storedName: "contract_1234567890.pdf",
  displayName: "Service Contract",
  mimeType: "application/pdf",
  size: 2048576,
  blobUrl: "https://storage.url/document.pdf",
  storagePath: "documents/user-123/2024/contract.pdf",
  anno: "2024"
});
```

## Database Features

### Foreign Key Constraints

- **Referential Integrity**: Automatic constraint enforcement
- **Cascade Deletes**: Clean up related data automatically
- **User Isolation**: Strict user-based data separation

### Indexing Strategy

- **Primary Keys**: UUID-based identifiers
- **Unique Constraints**: Prevent data duplication
- **Foreign Key Indexes**: Optimized joins and lookups
- **Search Indexes**: Full-text search capabilities

### Data Validation

- **Schema Validation**: Drizzle ORM type checking
- **Input Validation**: Zod schema validation
- **Business Rules**: Custom validation logic
- **Constraint Enforcement**: Database-level constraints

## Development Workflow

### Adding New Tables

1. **Create Schema**: Add new schema file in `src/schema/`
2. **Export Schema**: Update `src/schema/index.ts`
3. **Generate Migration**: Run `npm run generate`
4. **Apply Migration**: Run `npm run migrate`
5. **Create Queries**: Add query functions in `src/queries/`
6. **Add Tests**: Write tests for new functionality

### Updating Existing Tables

1. **Modify Schema**: Update schema definition
2. **Generate Migration**: Run `npm run generate`
3. **Review Migration**: Check generated SQL
4. **Apply Migration**: Run `npm run migrate`
5. **Update Queries**: Modify query functions as needed

## Scripts

```bash
# Development
npm run dev          # Start local Turso database
npm run studio       # Open Drizzle Studio

# Migrations
npm run generate     # Generate migration files
npm run migrate      # Apply migrations
npm run push         # Push schema changes (dev only)

# Build & Lint
npm run build        # Build the package
npm run lint         # Run ESLint
```

## Type Safety

The database package provides full TypeScript support:

```typescript
import type { Document, DocumentCreateDto } from "@repo/database/schema";

// Fully typed document object
const document: Document = await getDocument({ id: "doc-123", userId: "user-123" });

// Type-safe creation
const newDoc: DocumentCreateDto = {
  originalName: "file.pdf",
  storedName: "file_123.pdf",
  displayName: "My Document",
  mimeType: "application/pdf",
  size: 1024,
  blobUrl: "https://storage.url/file.pdf",
  storagePath: "documents/user/2024/file.pdf",
  anno: "2024"
};
```

## Error Handling

The package includes comprehensive error handling:

```typescript
try {
  const document = await getDocument({ id: "doc-123", userId: "user-123" });
}
catch (error) {
  if (error.message.includes("FOREIGN KEY constraint failed")) {
    // Handle foreign key violation
  }
  else if (error.message.includes("UNIQUE constraint failed")) {
    // Handle unique constraint violation
  }
  else {
    // Handle general database error
  }
}
```

## Performance Considerations

- **Pagination**: Use pagination for large result sets
- **Indexes**: Strategic indexing for common queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimized SQL generation

## Security Features

- **User Authorization**: All queries enforce user-based access
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **Foreign Key Constraints**: Data integrity enforcement

## Documentation

- **[DOCUMENTS.md](./DOCUMENTS.md)**: Complete document schema and query documentation
- **Schema Files**: Inline documentation in schema definitions
- **Query Functions**: JSDoc comments for all functions
- **Migration Files**: SQL migration documentation

## Contributing

When contributing to the database package:

1. **Follow Conventions**: Use existing naming patterns
2. **Add Documentation**: Document new schemas and functions
3. **Write Tests**: Include tests for new functionality
4. **Update Migrations**: Generate proper migration files
5. **Type Safety**: Ensure full TypeScript coverage

## Related Packages

- **[@repo/shared](../shared)**: Shared constants and utilities
- **[@repo/auth](../auth)**: Authentication components
- **[@repo/ui](../ui)**: UI components that use database types

---

For detailed documentation on specific features, see the corresponding documentation files in this package.
