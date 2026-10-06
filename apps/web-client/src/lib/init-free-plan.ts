import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { ZSAError } from "zsa";

import { env } from "@/env";

import { findCurrentStripeSubscription } from "./find-current-stripe-subscription";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function initFreePlan(priceId: string, user: { email: string; customerId?: string | null; id: string }, options?: { redirect?: string }) {
  let subscription: Stripe.Subscription | null = null;
  try {
    let customer: Stripe.Customer | null = null;
    if (!user.customerId) {
      customer = await stripe.customers.create({
        email: user.email,
      });
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          customerId: customer.id,
        },
      });
    }

    if (!customer?.id && !user.customerId) {
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione cliente");
    }

    const customerId = customer?.id || user.customerId || "";
    const existingSubscription = await findCurrentStripeSubscription(stripe, customerId);
    if (!existingSubscription) {
      const latest = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
      const mostRecent = latest.data[0];
      if (mostRecent && mostRecent.status !== "canceled" && mostRecent.status !== "incomplete_expired") {
        subscription = mostRecent;
      }
      else {
        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: "allow_incomplete",
        }, { idempotencyKey: `free-subscription:${customerId}:${mostRecent?.id || "initial"}:${priceId}` });
      }
    }
    else {
      subscription = existingSubscription;
    }
  }
  catch (error) {
    console.error(error);
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione sessione di pagamento");
  }

  if (options?.redirect) {
    redirect(options.redirect);
  }
  else {
    return subscription;
  }
}
