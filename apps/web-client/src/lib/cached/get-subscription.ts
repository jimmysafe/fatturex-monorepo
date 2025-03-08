"server-only";
import { cache } from "react";

import { getUserSubscription } from "@repo/database/queries/subscription";

import { session } from "../session";

export const _getUserSubscription = cache(async () => {
  const { user } = await session();
  return getUserSubscription(user.id);
});
