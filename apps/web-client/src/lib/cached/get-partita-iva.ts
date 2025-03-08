"server-only";
import { cache } from "react";

import { getPartitaIva } from "@repo/database/queries/partita-iva";

import { session } from "../session";

export const _getPartitaIva = cache(async () => {
  const { user } = await session();
  return getPartitaIva(user.id);
});
