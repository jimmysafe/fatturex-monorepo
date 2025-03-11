import { auth } from "@repo/auth";
import { getUserSubscription } from "@repo/database/queries/subscription";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { ZSAError } from "zsa";

import { env } from "@/env";

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

    const existingSubscription = await getUserSubscription(user.id);
    if (!existingSubscription) {
      subscription = await stripe.subscriptions.create({
        customer: customer?.id || user.customerId || "",
        items: [{ price: priceId }],
        payment_behavior: "allow_incomplete",
      });
    }
    else {
      subscription = await stripe.subscriptions.retrieve(existingSubscription.subscriptionId);
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
