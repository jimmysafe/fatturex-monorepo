import type { SQL } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { db } from "@repo/database/client";
import { count } from "drizzle-orm";

export async function getMeta(
  table: SQLiteTable,
  where: SQL | undefined,
  params: { page?: string; per_page?: string; sort?: string },
) {
  const query = db.select({ count: count() }).from(table);
  const counts = where ? await query.where(where) : await query;
  const total = counts[0]?.count || 0;

  const page = Number(params.page || "1");
  const per_page = Number(params.per_page || "10");

  const skip = (page - 1) * per_page;
  const itemCount = total;
  const pageCount = Math.ceil(itemCount / per_page);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < pageCount;

  const data = {
    itemCount,
    pageCount,
    hasPreviousPage,
    hasNextPage,
    perPage: Number(per_page),
    currentPage: Number(page),
  };

  return {
    data,
    skip,
  };
}
