import { db } from "@repo/database/client";
import { subscription as subscriptionSchema } from "@repo/database/schema";
import { eq } from "drizzle-orm";

export async function getUserSubscription(userId: string) {
  const sub = await db.query.subscription.findFirst({ where: eq(subscriptionSchema.userId, userId) });
  if (!sub)
    return null;

  return sub;
}
