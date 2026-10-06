import type Stripe from "stripe";

export async function findCurrentStripeSubscription(stripe: Stripe, customerId: string) {
  // Only terminal subscriptions can be replaced. Include payment failures,
  // trials and paused subscriptions even if the local database is out of sync.
  for await (const subscription of stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 })) {
    if (subscription.status !== "canceled" && subscription.status !== "incomplete_expired")
      return subscription;
  }
  return null;
}
