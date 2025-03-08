import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { between } from "drizzle-orm";
import { customType } from "drizzle-orm/sqlite-core";

export * from "drizzle-orm";

export const decimal = customType<{ data: number }>({
  dataType() {
    return "decimal(10, 2)";
  },
  // fromDriver(value) {
  //   return Number((value as number).toFixed(2));
  // },
  toDriver(value) {
    if (!value)
      return 0;
    if (typeof value !== "number")
      throw new Error("Value must be a number");
    return Number(value.toFixed(2));
  },
});

export function textEnum(name: string, _enum: string[]) {
  return customType<{ data: string }>({
    dataType() {
      return "text";
    },
    toDriver(value: string): string {
      if (!_enum.includes(value))
        throw new Error(`${name} must be one of ${_enum.join(", ")}`);
      return value;
    },
  })(name);
}

export function withinYear(column: SQLiteColumn, year: number | string) {
  const yyyy = typeof year === "number" ? year : Number(year);
  return between(column, new Date(`${yyyy}-01-01`), new Date(`${yyyy}-12-31`));
}
