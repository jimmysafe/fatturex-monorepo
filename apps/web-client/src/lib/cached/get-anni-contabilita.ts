"server-only";
import { cache } from "react";

import { getAnniContabilita } from "@repo/database/queries/contabilita";

import { session } from "../session";

export const _getAnniContabilita = cache(async () => {
  const { user } = await session();
  return getAnniContabilita({ userId: user.id });
});
