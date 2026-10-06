import type Stripe from "stripe";

export async function prepareSubscriptionCheckout(stripe: Stripe, customerId: string, userId: string, priceId: string) {
  const latest = await stripe.checkout.sessions.list({ customer: customerId, limit: 1 });
  let reusable: Stripe.Checkout.Session | null = null;
  for await (const session of stripe.checkout.sessions.list({ customer: customerId, status: "open", limit: 100 })) {
    if (session.mode !== "subscription" || session.metadata?.userId !== userId)
      continue;
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
    if (!reusable && items.data.length === 1 && items.data[0].price?.id === priceId && session.url) {
      reusable = session;
    }
    else {
      // An abandoned checkout for another plan must not remain payable.
      await stripe.checkout.sessions.expire(session.id);
    }
  }
  return {
    session: reusable,
    // Concurrent requests from the same checkout state share a key, including
    // requests for different prices (Stripe rejects conflicting parameters).
    idempotencyKey: `subscription-checkout:${customerId}:${latest.data[0]?.id || "initial"}`,
  };
}
