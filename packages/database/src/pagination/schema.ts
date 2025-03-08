import type { ZodSchema } from "zod";

import { z } from "zod";

export const PaginationParamsSchema = z.object({
  page: z.string().default("1").optional(),
  per_page: z.string().default("10").optional(),
  sort: z.string().optional(),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginationMetaSchema = z.object({
  itemCount: z.number(),
  pageCount: z.number(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
  perPage: z.number(),
  currentPage: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
};

export function PaginatedResponse<T>(schema: ZodSchema<T>) {
  return z.object({
    data: z.array(schema),
    meta: PaginationMetaSchema,
  });
}
