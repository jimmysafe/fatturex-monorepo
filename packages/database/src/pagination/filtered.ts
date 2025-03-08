import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { ZodSchema } from "zod";

import { or, sql } from "drizzle-orm";

export function filtered<T extends SQLiteTable>(
  table: T,
  filterSchema: ZodSchema,
  filterParams?: Record<string, unknown>,
  searchColumns: Array<keyof T> = [],
) {
  if (!filterParams)
    return undefined;
  const { success, data } = filterSchema.safeParse(filterParams);
  if (!success)
    return undefined;

  const filtersArray = Object.entries(data).map(([key, value]) => ({
    id: key,
    value,
  }));

  if (filtersArray.length === 0)
    return undefined;

  const filters = filtersArray.map((f) => {
    // When using search, we search into all table columns declared inside searchColumns
    if (f.id === "search" && searchColumns.length > 0) {
      const searchFilter = searchColumns.map((column) => {
        return sql`${table[column]} LIKE ${`%${f.value}%`}`;
      });
      return or(...searchFilter);
    }
    else {
      // @ts-expect-error - we know this is a column
      const column = table[f.id as keyof (typeof table)["_"]["columns"]];
      return sql`${column} LIKE ${`%${f.value}%`}`;
    }
  });

  return sql.join(filters, "and");
}
