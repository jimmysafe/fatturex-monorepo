import { auth } from "@repo/auth";
import { headers } from "next/headers";
import Stripe from "stripe";
import { ZSAError } from "zsa";

import { env } from "@/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function initFreePlan(priceId: string, user: { email: string; customerId?: string | null }) {
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

    const sub = await stripe.subscriptions.create({
      customer: customer?.id || user.customerId || "",
      items: [{ price: priceId }], // Replace with your $0 or free trial price ID
      payment_behavior: "allow_incomplete", // Don't require payment immediately
    });
    return sub;
  }
  catch (error) {
    console.error(error);
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione sessione di pagamento");
  }
}
