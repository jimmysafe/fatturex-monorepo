import { headers } from "next/headers";
import Stripe from "stripe";

import { env } from "@/env";

import { handleInvoiceEvent, handleSubscriptionEvent } from "./events";

export async function POST(request: Request) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;

  try {
    if (!signature)
      throw new Error("Verifica firma webhook fallita.");
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    console.error(err);
    return Response.json({ error: "Firma webhook non valida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionEvent(event, "created");
        break;
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event, "updated");
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event, "deleted");
        break;
      case "invoice.payment_failed":
        await handleInvoiceEvent(event, "payment_failed");
        break;
      case "invoice.payment_succeeded":
        await handleInvoiceEvent(event, "payment_succeeded");
        break;
      default:
        break;
    }

    return Response.json({ event: event.type }, { status: 200 });
  }
  catch (err) {
    console.error(err);
    return Response.json({ error: "Errore durante l'elaborazione dell'evento" }, { status: 500 });
  }
}
