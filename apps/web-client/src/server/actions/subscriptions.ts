"use server";
import { db } from "@repo/database/client";
import { and, eq } from "@repo/database/lib/utils";
import { subscription as _subscription, UpdateSubscriptionSchema } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { plans } from "@repo/shared/plans";
import Stripe from "stripe";
import { z } from "zod";
import { ZSAError } from "zsa";

import { env } from "@/env";
import { initFreePlan } from "@/lib/init-free-plan";

import { authProcedure } from "../procedures/authenticated";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const createCheckoutSession = authProcedure
  .createServerAction()
  .input(z.object({ priceId: z.string().min(1) }))
  .handler(async ({ input: { priceId }, ctx: { user } }) => {
    const plan = plans.find(p => p.priceId === priceId);
    if (!plan)
      throw new ZSAError("NOT_FOUND", "Piano non trovato");

    if (plan.price.monthly === 0) {
      return initFreePlan(priceId, user, { redirect: "/" });
    }

    const payload: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${env.NEXT_PUBLIC_APP_URL}/`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/`,
      locale: "it",
      metadata: { userId: user.id, email: user.email },
    };

    const session = await stripe.checkout.sessions.create(user?.customerId
      ? {
          ...payload,
          customer: user.customerId,
        }
      : {
          ...payload,
          customer_email: user.email,
        });

    if (!session?.id)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione sessione di pagamento");

    return session;
  });

export const createCustomerPortalSession = authProcedure
  .createServerAction()
  .input(z.object({
    type: z.enum(["subscription_update_confirm", "default"]).default("default"),
    priceId: z.string().optional(),
  }).optional())
  .handler(async ({ input, ctx: { user } }) => {
    if (!user?.customerId)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione sessione portale cliente");

    let subscription: Stripe.Subscription | null = null;
    if (input?.type === "subscription_update_confirm" && input?.priceId) {
      const dbSub = await db.query.subscription.findFirst({ columns: { subscriptionId: true }, where: eq(_subscription.userId, user.id) });
      if (dbSub) {
        subscription = await stripe.subscriptions.retrieve(dbSub.subscriptionId);
        if (!subscription)
          throw new ZSAError("NOT_FOUND", "Abbonamento non trovato");
      }
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/${new Date().getFullYear()}/profilo`,
      locale: "it",
      flow_data: subscription
        ? {
            type: "subscription_update_confirm",
            subscription_update_confirm: {
              subscription: subscription.id,
              items: [{
                id: subscription.items.data[0].id,
                price: input?.priceId,
                quantity: 1,
              }],
            },
          }
        : undefined,
    });

    if (!session?.url)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione sessione portale cliente");

    return session;
  });

export const updateSubscription = authProcedure
  .createServerAction()
  .input(z.object({ ...UpdateSubscriptionSchema.shape, ...IdParamSchema.shape }))
  .handler(async ({ input, ctx: { user } }) => {
    const [updatedSubscription] = await db
      .update(_subscription)
      .set(input)
      .where(and(
        eq(_subscription.userId, user.id),
        eq(_subscription.id, input.id),
      ))
      .returning();

    if (!updatedSubscription)
      throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore aggiornamento abbonamento");

    return updatedSubscription;
  });
