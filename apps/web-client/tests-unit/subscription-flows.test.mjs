/* eslint-disable test/no-import-node-test -- Use the built-in runner without adding production dependencies. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import ts from "typescript";

const require = createRequire(import.meta.url);
const { z } = require("zod");

const states = { ATTIVO: "Attivo", CANCELLATO: "Cancellato", SCADUTO: "Scaduto", PAGAMENTO_RICHIESTO: "Pagamento Richiesto" };
const env = { STRIPE_SECRET_KEY: "mock-only", NEXT_PUBLIC_APP_URL: "https://app.example.test" };

// Execute the actual server modules with isolated dependencies. No requests to
// Stripe, the database, or the production E2E baseURL can occur in these tests.
function loadModule(path, mocks) {
  const source = readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const testModule = { exports: {} };
  runInNewContext(code, {
    exports: testModule.exports,
    module: testModule,
    require(name) {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    },
    console,
    Date,
  });
  return testModule.exports;
}

const lookup = loadModule("lib/find-current-stripe-subscription.ts", {});
const prepareCheckout = loadModule("lib/prepare-subscription-checkout.ts", {});

function fixture(subscriptions = []) {
  const calls = { checkout: [], checkoutOptions: [], portal: [], cancel: [], updates: [], free: [], list: [] };
  const stripe = {
    subscriptions: {
      list(params) {
        calls.list.push(params);
        return {
          data: subscriptions.slice(0, params.limit),
          async* [Symbol.asyncIterator]() {
            yield* subscriptions;
          },
        };
      },
      retrieve: async id => ({ id, customer: "cus_current", status: "active", created: id === "sub_old" ? 1 : 2, items: { data: [{ price: { id: id === "sub_old" ? "price_free" : "price_base" } }] }, current_period_start: 100, current_period_end: 200 }),
      cancel: async id => calls.cancel.push(id),
    },
    checkout: { sessions: { list: () => ({ data: [], async* [Symbol.asyncIterator]() {} }), create: async (payload, options) => {
      calls.checkout.push(payload);
      calls.checkoutOptions.push(options);
      return { id: "cs_new", url: "https://checkout.example.test" };
    } } },
    billingPortal: { sessions: { create: async (payload) => {
      calls.portal.push(payload);
      return { url: "https://portal.example.test" };
    } } },
    customers: { retrieve: async () => ({ id: "cus_current", email: "user@example.test" }) },
  };
  const db = {
    query: {
      user: { findFirst: async () => ({ id: "user", customerId: "cus_current", subscription: { subscriptionId: "sub_old", stato: states.CANCELLATO } }) },
      subscription: { findFirst: async () => null },
    },
    update: () => ({ set: payload => ({ where: async () => { calls.updates.push(payload); } }) }),
  };
  const plan = { label: "Base", price: { monthly: { amount: 4.99 } }, fteEnabled: true, numberOfInvoices: 10, numberOfSearches: 3 };
  const mocks = {
    "@repo/database/client": { db },
    "@repo/database/lib/utils": { eq: () => true, and: () => true },
    "@repo/database/lib/enums": { SubscriptionStato: states },
    "@repo/database/schema": { subscription: {}, user: {}, UpdateSubscriptionSchema: z.object({}) },
    "@repo/shared/params-validators": { IdParamSchema: z.object({}) },
    "@repo/shared/plans": { getPlan: id => id === "invalid" ? undefined : id === "price_free" ? { ...plan, price: { monthly: { amount: 0 } } } : plan },
    "stripe": class { constructor() { return stripe; } },
    "zod": { z },
    "zsa": { ZSAError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    } },
    "@/env": { env },
    "@/lib/find-current-stripe-subscription": lookup,
    "@/lib/prepare-subscription-checkout": prepareCheckout,
    "@/lib/init-free-plan": { initFreePlan: async (...args) => {
      calls.free.push(args);
      return { id: "sub_free" };
    } },
    "../procedures/authenticated": { authProcedure: { createServerAction: () => ({ input: () => ({ handler: fn => fn }) }) } },
    "date-fns": { isEqual: (a, b) => a.getTime() === b.getTime() },
  };
  return { calls, stripe, db, plan, mocks };
}

function checkout(f, priceId = "price_base") {
  const { createCheckoutSession } = loadModule("server/actions/subscriptions.ts", f.mocks);
  return createCheckoutSession({ input: { priceId }, ctx: { user: { id: "user", email: "user@example.test", customerId: "cus_stale_session" } } });
}

for (const status of ["active", "trialing", "past_due", "unpaid", "paused"]) {
  test(`Checkout redirects ${status} subscriptions to portal despite stale local state`, async () => {
    const f = fixture([{ id: "sub_existing", status }]);
    const result = await checkout(f);
    assert.equal(result.url, "https://portal.example.test");
    assert.equal(f.calls.portal[0].customer, "cus_current");
    assert.equal(f.calls.checkout.length, 0);
    assert.equal(f.calls.free.length, 0);
  });
}

test("Canceled and expired subscriptions allow a new paid Checkout with the existing customer", async () => {
  const f = fixture([{ status: "canceled" }, { status: "incomplete_expired" }]);
  await checkout(f);
  assert.equal(f.calls.checkout.length, 1);
  assert.equal(f.calls.checkout[0].customer, "cus_current");
  assert.equal(f.calls.checkout[0].line_items[0].price, "price_base");
  assert.equal(f.calls.portal.length, 0);
});

test("A customer without a Stripe subscription can subscribe", async () => {
  const f = fixture();
  await checkout(f);
  assert.equal(f.calls.checkout.length, 1);
});

test("Incomplete payments block new purchases", async () => {
  const f = fixture([{ status: "incomplete" }]);
  await assert.rejects(checkout(f), /pagamento di abbonamento in corso/);
  assert.equal(f.calls.checkout.length, 0);
  assert.equal(f.calls.portal.length, 0);
});

test("Stripe lookup failures fail closed", async () => {
  const f = fixture();
  f.stripe.subscriptions.list = () => {
    throw new Error("Stripe unavailable");
  };
  await assert.rejects(checkout(f), /Stripe unavailable/);
  assert.equal(f.calls.checkout.length, 0);
  assert.equal(f.calls.free.length, 0);
});

test("Lookup checks beyond the first 100 terminal subscriptions", async () => {
  const f = fixture([...Array.from({ length: 100 }, () => ({ status: "canceled" })), { status: "active" }]);
  await checkout(f);
  assert.equal(f.calls.checkout.length, 0);
  assert.equal(f.calls.portal.length, 1);
  assert.equal(f.calls.list[0].status, "all");
});

test("Free selection also checks existing subscriptions before initialization", async () => {
  const f = fixture([{ status: "active" }]);
  f.plan.price.monthly.amount = 0;
  await checkout(f, "price_free");
  assert.equal(f.calls.free.length, 0);
  assert.equal(f.calls.portal.length, 1);
});

test("Free selection is available after cancellation", async () => {
  const f = fixture([{ status: "canceled" }]);
  f.plan.price.monthly.amount = 0;
  await checkout(f, "price_free");
  assert.equal(f.calls.free.length, 1);
  assert.equal(f.calls.free[0][1].customerId, "cus_current");
});

test("Invalid prices never initiate billing", async () => {
  const f = fixture();
  await assert.rejects(checkout(f, "invalid"), /Piano non trovato/);
  assert.equal(f.calls.checkout.length, 0);
});

for (const localState of [states.CANCELLATO, states.SCADUTO, states.ATTIVO]) {
  test(`Creation webhook syncs a new subscription when previous local state is ${localState}`, async () => {
    const f = fixture();
    f.db.query.user.findFirst = async () => ({ id: "user", subscription: { id: "db_sub", subscriptionId: "sub_old", stato: localState } });
    const { handleSubscriptionEvent } = loadModule("app/api/webhooks/stripe/events.ts", f.mocks);
    await handleSubscriptionEvent({ data: { object: { id: "sub_new", customer: "cus_current", plan: { id: "price_base" }, current_period_start: 100, current_period_end: 200 } } }, "created");
    assert.equal(f.calls.cancel.length, localState === states.ATTIVO ? 1 : 0);
    assert.equal(f.calls.updates[0].subscriptionId, "sub_new");
    assert.equal(f.calls.updates[0].stato, states.ATTIVO);
  });
}

test("Retrying a creation webhook never cancels the current subscription", async () => {
  const f = fixture();
  f.db.query.user.findFirst = async () => ({ id: "user", subscription: { id: "db_sub", subscriptionId: "sub_new", stato: states.ATTIVO } });
  const { handleSubscriptionEvent } = loadModule("app/api/webhooks/stripe/events.ts", f.mocks);
  await handleSubscriptionEvent({ data: { object: { id: "sub_new", customer: "cus_current", plan: { id: "price_base" }, current_period_start: 100, current_period_end: 200 } } }, "created");
  assert.equal(f.calls.cancel.length, 0);
  assert.equal(f.calls.updates.length, 0);
});

test("Free initialization creates a new subscription instead of retrieving a canceled DB subscription", async () => {
  const f = fixture([{ status: "canceled" }]);
  const created = [];
  f.stripe.subscriptions.create = async (payload) => {
    created.push(payload);
    return { id: "sub_free_new" };
  };
  f.stripe.subscriptions.retrieve = async () => {
    throw new Error("Must not retrieve the obsolete subscription ID");
  };
  const { initFreePlan } = loadModule("lib/init-free-plan.ts", {
    "@repo/auth": { auth: {} },
    "next/headers": { headers: async () => ({}) },
    "next/navigation": { redirect: () => {} },
    "stripe": f.mocks.stripe,
    "zsa": f.mocks.zsa,
    "@/env": { env },
    "./find-current-stripe-subscription": lookup,
  });
  const result = await initFreePlan("price_free", { id: "user", email: "user@example.test", customerId: "cus_current" });
  assert.equal(result.id, "sub_free_new");
  assert.equal(created[0].customer, "cus_current");
});

for (const state of [null, states.CANCELLATO, states.SCADUTO, states.ATTIVO, states.PAGAMENTO_RICHIESTO]) {
  test(`Profile plan actions for ${state ?? "missing subscription"}`, async () => {
    const jsx = (type, props) => ({ type, props });
    const componentNames = names => Object.fromEntries(names.split(" ").map(name => [name, name]));
    const mocks = {
      "react": { Suspense: "Suspense" },
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "@repo/database/lib/enums": { SubscriptionStato: states },
      "@repo/shared/plans": { getPlan: () => ({ label: "Base", price: { monthly: {}, yearly: {} } }) },
      "@repo/shared/price": { price: () => "4,99 €" },
      "@repo/ui/components/ui/alert": componentNames("Alert AlertDescription AlertTitle"),
      "@repo/ui/components/ui/badge": componentNames("Badge"),
      "@repo/ui/components/ui/button": componentNames("Button"),
      "@repo/ui/components/ui/card": componentNames("Card CardContent CardDescription CardFooter CardHeader CardTitle"),
      "@repo/ui/components/ui/progress": componentNames("Progress"),
      "@repo/ui/components/ui/separator": componentNames("Separator"),
      "@repo/ui/components/ui/skeleton": componentNames("Skeleton"),
      "date-fns": { format: () => "date" },
      "date-fns/locale": { it: {} },
      "lucide-react": componentNames("Calendar CreditCard ExternalLink Link Package Rocket"),
      "next/link": "NextLink",
      "@/components/common/open-customer-portal-button": componentNames("OpenCustomerPortalButton"),
      "@/lib/cached/get-partita-iva": { _getPartitaIva: async () => null },
      "@/lib/cached/get-subscription": { _getUserSubscription: async () => state ? { stato: state } : null },
      "../abbonamento/upgrade-modal": componentNames("UpgradeModal"),
      "../partita-iva/fte-configuration-modal": componentNames("FteConfigurationModal"),
      "./fte-success-configuration": componentNames("FteSuccessConfiguration"),
    };
    const { Content } = loadModule("components/modules/profilo/abbonamento-card.tsx", mocks);
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) {
        node.forEach(visit);
      }
      else if (node && typeof node === "object") {
        nodes.push(node);
        visit(node.props?.children);
      }
    }
    visit(await Content());
    const choosePlan = nodes.filter(node => node.props?.href === "/payment/plans");
    assert.equal(choosePlan.length, [null, states.CANCELLATO, states.SCADUTO].includes(state) ? 1 : 0);
    assert.equal(nodes.filter(node => node.type === "UpgradeModal").length, state === states.ATTIVO ? 1 : 0);
    assert.equal(nodes.filter(node => node.type === "OpenCustomerPortalButton").length, 1);
  });
}

function checkoutSessions(f, sessions) {
  f.stripe.checkout.sessions.list = params => ({
    data: params.status ? sessions.filter(session => session.status === params.status) : sessions.slice(0, params.limit),
    async* [Symbol.asyncIterator]() {
      yield* sessions.filter(session => !params.status || session.status === params.status);
    },
  });
  f.stripe.checkout.sessions.listLineItems = async id => ({ data: [{ price: { id: sessions.find(session => session.id === id).priceId } }] });
  f.stripe.checkout.sessions.expire = async (id) => {
    sessions.find(session => session.id === id).status = "expired";
  };
}

test("An open Checkout for the chosen price is reused", async () => {
  const f = fixture();
  checkoutSessions(f, [{ id: "cs_open", mode: "subscription", status: "open", metadata: { userId: "user" }, priceId: "price_base", url: "https://checkout.example.test/existing" }]);
  const result = await checkout(f);
  assert.equal(result.id, "cs_open");
  assert.equal(f.calls.checkout.length, 0);
});

test("Changing plan expires abandoned Checkouts before creating another", async () => {
  const f = fixture();
  const sessions = [{ id: "cs_open", mode: "subscription", status: "open", metadata: { userId: "user" }, priceId: "price_old", url: "https://checkout.example.test/existing" }];
  checkoutSessions(f, sessions);
  await checkout(f);
  assert.equal(sessions[0].status, "expired");
  assert.equal(f.calls.checkout.length, 1);
  assert.match(f.calls.checkoutOptions[0].idempotencyKey, /cs_open$/);
});

test("Concurrent checkout requests share the same Stripe idempotency key", async () => {
  const f = fixture();
  await Promise.all([checkout(f), checkout(f)]);
  assert.equal(f.calls.checkoutOptions.length, 2);
  assert.equal(f.calls.checkoutOptions[0].idempotencyKey, f.calls.checkoutOptions[1].idempotencyKey);
});

test("Failure to expire an abandoned Checkout blocks creation of another", async () => {
  const f = fixture();
  checkoutSessions(f, [{ id: "cs_open", mode: "subscription", status: "open", metadata: { userId: "user" }, priceId: "price_old" }]);
  f.stripe.checkout.sessions.expire = async () => {
    throw new Error("Checkout already completing");
  };
  await assert.rejects(checkout(f), /already completing/);
  assert.equal(f.calls.checkout.length, 0);
});

test("Selecting Free expires abandoned paid Checkouts", async () => {
  const f = fixture();
  const sessions = [{ id: "cs_open", mode: "subscription", status: "open", metadata: { userId: "user" }, priceId: "price_base" }];
  checkoutSessions(f, sessions);
  await checkout(f, "price_free");
  assert.equal(sessions[0].status, "expired");
  assert.equal(f.calls.free.length, 1);
});

test("Missing customer mapping blocks paid Checkout", async () => {
  const f = fixture();
  f.db.query.user.findFirst = async () => ({ customerId: null });
  await assert.rejects(checkout(f), /Cliente di fatturazione non trovato/);
  assert.equal(f.calls.checkout.length, 0);
});

test("A Checkout without a hosted URL is treated as an error", async () => {
  const f = fixture();
  f.stripe.checkout.sessions.create = async () => ({ id: "cs_invalid", url: null });
  await assert.rejects(checkout(f), /Errore creazione sessione/);
});

test("A delayed creation event for a terminal subscription cannot replace the current plan", async () => {
  const f = fixture();
  f.stripe.subscriptions.retrieve = async id => ({ id, status: "canceled" });
  const { handleSubscriptionEvent } = loadModule("app/api/webhooks/stripe/events.ts", f.mocks);
  await handleSubscriptionEvent({ data: { object: { id: "sub_obsolete", customer: "cus_current", plan: { id: "price_base" } } } }, "created");
  assert.equal(f.calls.updates.length, 0);
  assert.equal(f.calls.cancel.length, 0);
});

test("A creation event cannot grant paid access before payment activation", async () => {
  const f = fixture();
  f.stripe.subscriptions.retrieve = async id => ({ id, status: "incomplete" });
  const { handleSubscriptionEvent } = loadModule("app/api/webhooks/stripe/events.ts", f.mocks);
  await assert.rejects(handleSubscriptionEvent({ data: { object: { id: "sub_new", customer: "cus_current", plan: { id: "price_base" } } } }, "created"), /not yet active/);
  assert.equal(f.calls.updates.length, 0);
});

test("A creation event never cancels an existing paid subscription", async () => {
  const f = fixture();
  f.db.query.user.findFirst = async () => ({ id: "user", subscription: { id: "db_sub", subscriptionId: "sub_old", stato: states.ATTIVO } });
  const retrieve = f.stripe.subscriptions.retrieve;
  f.stripe.subscriptions.retrieve = async (id) => {
    const subscription = await retrieve(id);
    subscription.items.data[0].price.id = "price_base";
    return subscription;
  };
  const { handleSubscriptionEvent } = loadModule("app/api/webhooks/stripe/events.ts", f.mocks);
  await assert.rejects(handleSubscriptionEvent({ data: { object: { id: "sub_new", customer: "cus_current", plan: { id: "price_base" } } } }, "created"), /existing paid subscription/);
  assert.equal(f.calls.cancel.length, 0);
});

for (const [status, expected] of [["canceled", states.CANCELLATO], ["incomplete_expired", states.SCADUTO], ["past_due", states.PAGAMENTO_RICHIESTO], ["unpaid", states.PAGAMENTO_RICHIESTO], ["active", states.ATTIVO]]) {
  test(`An outdated update snapshot uses live Stripe state ${status}`, async () => {
    const f = fixture();
    f.db.query.subscription.findFirst = async () => ({ id: "db_sub", endDate: new Date(200000), invoicesCount: 4, searchesCount: 2 });
    const retrieve = f.stripe.subscriptions.retrieve;
    f.stripe.subscriptions.retrieve = async id => ({ ...await retrieve(id), status });
    const { handleSubscriptionEvent } = loadModule("app/api/webhooks/stripe/events.ts", f.mocks);
    await handleSubscriptionEvent({ data: { object: { id: "sub_new", customer: "cus_current", plan: { id: "price_base" }, status: "active" } } }, "updated");
    assert.equal(f.calls.updates[0].stato, expected);
    assert.equal(f.calls.updates[0].invoicesCount, 4);
    assert.equal(f.calls.updates[0].fteEnabled, status === "active");
  });
}
