import type { SubscriptionUpdateDto } from "@repo/database/schema";

import { db } from "@repo/database/client";
import { SubscriptionStato } from "@repo/database/lib/enums";
import { eq } from "@repo/database/lib/utils";
import { subscription as _subscription, user as _user } from "@repo/database/schema";
import { DEFAULT_NUMBER_OF_INVOICES, DEFAULT_NUMBER_OF_SEARCHES, getPlan } from "@repo/shared/plans";
import { isEqual } from "date-fns";
import Stripe from "stripe";

import { env } from "@/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function handleSubscriptionEvent(event: Stripe.Event, type: "created" | "updated" | "deleted") {
  let subscription = event.data.object as Stripe.Subscription & { plan?: Stripe.Plan };

  let plan = getPlan(subscription.items?.data[0]?.price.id || subscription.plan?.id);
  if (!plan)
    throw new Error("Plan not found");

  const customer = await stripe.customers.retrieve(subscription.customer.toString()) as Stripe.Customer;

  if (type === "created") {
    // console.log('CREATING SUBSCRIPTION', subscription.id);
    const user = await db.query.user.findFirst({ with: { subscription: true }, where: eq(_user.customerId, customer.id) });
    if (!user)
      throw new Error("User not found");

    // The DB write already completed: a retry must not reset usage counters.
    if (user.subscription?.subscriptionId === subscription.id)
      return { event: type };

    subscription = await stripe.subscriptions.retrieve(subscription.id);
    if (subscription.status === "canceled" || subscription.status === "incomplete_expired")
      return { event: type };
    if (subscription.status !== "active" && subscription.status !== "trialing")
      throw new Error("Subscription is not yet active; retry synchronization later");
    plan = getPlan(subscription.items.data[0]?.price.id);
    if (!plan)
      throw new Error("Plan not found");

    if (user.subscription?.subscriptionId && user.subscription.subscriptionId !== subscription.id) {
      // Reactivation replaces a terminal subscription: canceling it again would
      // fail the webhook and leave the new subscription unsynced in our DB.
      if (user.subscription.stato !== SubscriptionStato.CANCELLATO && user.subscription.stato !== SubscriptionStato.SCADUTO) {
        const previousSubscription = await stripe.subscriptions.retrieve(user.subscription.subscriptionId);
        if (previousSubscription.customer.toString() !== customer.id)
          throw new Error("Previous subscription belongs to a different customer");
        if (previousSubscription.created > subscription.created)
          return { event: type };
        if (previousSubscription.status !== "canceled" && previousSubscription.status !== "incomplete_expired") {
          if (getPlan(previousSubscription.items.data[0]?.price.id)?.price.monthly.amount !== 0)
            throw new Error("Refusing to replace an existing paid subscription");
          await stripe.subscriptions.cancel(previousSubscription.id);
        }
      }
    }

    const payload = {
      email: customer.email,
      subscriptionId: subscription.id,
      planId: subscription.items.data[0].price.id,
      stato: SubscriptionStato.ATTIVO,
      plan: plan.label,
      fteEnabled: plan.fteEnabled,
      invoicesLimit: plan.numberOfInvoices,
      invoicesCount: 0,
      searchesLimit: plan.numberOfSearches,
      searchesCount: 0,
      endDate: new Date(subscription.current_period_end * 1000),
      startDate: new Date(subscription.current_period_start * 1000),
    } satisfies SubscriptionUpdateDto;

    if (user.subscription?.id) {
      await db
        .update(_subscription)
        .set(payload)
        .where(eq(_subscription.id, user.subscription.id));
    }
    else {
      await db
        .insert(_subscription)
        .values({ ...payload, userId: user.id });
    }

    return { event: type };
  }

  if (type === "updated") {
    // console.log('UPDATING SUBSCRIPTION', subscription.id, subscription.status);
    const existing = await db.query.subscription.findFirst({ where: eq(_subscription.subscriptionId, subscription.id) });
    if (!existing)
      return console.error("UPDATE SUBSCRIPTION WH: Subscription not found");

    // Stripe can deliver updates out of order, including after cancellation.
    subscription = await stripe.subscriptions.retrieve(subscription.id);
    plan = getPlan(subscription.items.data[0]?.price.id);
    if (!plan)
      throw new Error("Plan not found");
    const state = subscription.status === "canceled"
      ? SubscriptionStato.CANCELLATO
      : subscription.status === "incomplete_expired"
        ? SubscriptionStato.SCADUTO
        : subscription.status === "active" || subscription.status === "trialing"
          ? SubscriptionStato.ATTIVO
          : SubscriptionStato.PAGAMENTO_RICHIESTO;
    const hasAccess = state === SubscriptionStato.ATTIVO;
    const isNewCycle = !isEqual(existing.endDate, new Date(subscription.current_period_end * 1000));

    // if (isNewCycle) console.log('[NEW_CYCLE]: Resetting invoicesCount besause is a newCycle.')

    await db
      .update(_subscription)
      .set({
        email: customer.email,
        subscriptionId: subscription.id,
        planId: subscription.items.data[0].price.id,
        stato: state,
        plan: plan.label,
        fteEnabled: hasAccess && plan.fteEnabled,
        invoicesLimit: hasAccess ? plan.numberOfInvoices : DEFAULT_NUMBER_OF_INVOICES,
        invoicesCount: isNewCycle ? 0 : existing.invoicesCount,
        searchesLimit: hasAccess ? plan.numberOfSearches : DEFAULT_NUMBER_OF_SEARCHES,
        searchesCount: isNewCycle ? 0 : existing.searchesCount,
        endDate: new Date(subscription.current_period_end * 1000),
        startDate: new Date(subscription.current_period_start * 1000),
      })
      .where(eq(_subscription.id, existing.id));
  }

  if (type === "deleted") {
    // console.log('CANCELLING SUBSCRIPTION', subscription.id);
    const existing = await db.query.subscription.findFirst({ where: eq(_subscription.subscriptionId, subscription.id) });
    if (!existing)
      return console.error("CANCEL SUBSCRIPTION WH: Subscription not found");

    await db
      .update(_subscription)
      .set({
        stato: SubscriptionStato.CANCELLATO,
        endDate: new Date(subscription.current_period_end * 1000),
        startDate: new Date(subscription.current_period_start * 1000),
        fteEnabled: false,
        invoicesLimit: DEFAULT_NUMBER_OF_INVOICES,
        searchesLimit: DEFAULT_NUMBER_OF_SEARCHES,
      })
      .where(eq(_subscription.id, existing.id));
  }
}

export async function handleInvoiceEvent(event: Stripe.Event, type: "payment_failed" | "payment_succeeded") {
  const invoice = event.data.object as Stripe.Invoice;
  if (!invoice.subscription)
    return console.error("No subscription found in invoice", invoice.id);

  if (type === "payment_failed" && invoice.next_payment_attempt === null) {
    await stripe.subscriptions.update(invoice.subscription.toString(), {
      cancel_at_period_end: true,
    });
  }

  if (type === "payment_succeeded") {
    await stripe.subscriptions.update(invoice.subscription.toString(), {
      cancel_at_period_end: false,
    });
  }
}
