"use server";
import type { UserCassaType } from "@repo/database/lib/enums";

import { auth } from "@repo/auth";
import { db } from "@repo/database/client";
import { UserCassa } from "@repo/database/lib/enums";
import { eq } from "@repo/database/lib/utils";
import { codiceAteco, contabilita, user as dbUser, indirizzo, partitaIva } from "@repo/database/schema";
import { IdParamSchema } from "@repo/shared/params-validators";
import { getPlanByLabel } from "@repo/shared/plans";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { z } from "zod";
import { createServerAction, ZSAError } from "zsa";

import { OnboardingSchema } from "@/components/modules/auth/onboarding-steps/schema";
import { env } from "@/env";
import { initFreePlan } from "@/lib/init-free-plan";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const signInOtp = createServerAction().input(z.object({ email: z.string().email(), otp: z.string() })).handler(async ({ input }) => {
  try {
    await auth.api.signInEmailOTP({
      body: {
        email: input.email,
        otp: input.otp,
      },
    });
  }
  catch (err: any) {
    if (err.body?.code === "INVALID_OTP")
      throw new ZSAError("UNPROCESSABLE_CONTENT", "OTP non valido.");
    if (err.body?.code === "OTP_EXPIRED")
      throw new ZSAError("UNPROCESSABLE_CONTENT", "OTP scaduto.");

    throw new ZSAError("INTERNAL_SERVER_ERROR", "Errore di autenticazione.");
  }
  redirect(`/${new Date().getFullYear()}`);
});

export const getUserPublicDetails = createServerAction().input(IdParamSchema).handler(async ({ input: { id } }) => {
  const usr = await db.query.user.findFirst({ where: eq(dbUser.id, id) });
  return {
    id: usr?.id,
    nome: usr?.nome,
    cognome: usr?.cognome,
    cassa: usr?.cassa,
    onboarded: usr?.onboarded,
    dataDiNascita: usr?.dataDiNascita,
    role: usr?.role,
    customerId: usr?.customerId,
    logoPath: usr?.logoPath,
    themeColor: usr?.themeColor,
  };
});

export const onboardUser = createServerAction().input(OnboardingSchema.extend({ dataDiNascita: z.coerce.date() })).handler(async ({ input }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user)
    throw new ZSAError("FORBIDDEN", "Non autenticato");

  const ateco = await db.query.codiceAteco.findFirst({
    columns: {
      coefficienteRedditivita: true,
    },
    where: eq(codiceAteco.codice, input.codiceAteco),
  });

  if (!ateco)
    throw new ZSAError("NOT_FOUND", "Codice Ateco non trovato");

  const anniPartitaIva
          = new Date().getFullYear() - new Date(input.dataApertura).getFullYear() + 1;

  const transaction = await db.transaction(async (tx) => {
    try {
      if (anniPartitaIva > 1) {
        await tx.insert(contabilita).values({ anno: new Date().getFullYear() - 1, userId: user.id });
      }
      await tx.insert(contabilita).values({ anno: new Date().getFullYear(), userId: user.id });

      if (user.cassa === UserCassa.CASSA_FORENSE && !input.dataIscrizioneCassa)
        throw new ZSAError("UNPROCESSABLE_CONTENT", "Data iscrizione cassa obbligatoria per Cassa Forense");

      await tx.insert(partitaIva).values({
        codiceAteco: input.codiceAteco,
        coefficienteRedditivita: ateco.coefficienteRedditivita,
        dataApertura: new Date(input.dataApertura),
        cap: input.cap,
        comune: input.comune,
        indirizzo: input.indirizzo,
        numero: input.partitaIva,
        provincia: input.provincia,
        codiceFiscale: input.codiceFiscale.toUpperCase(),
        userId: user.id,
        paese: "IT",
        dataIscrizioneCassa: input.dataApertura ? new Date(input.dataApertura) : null,
      }).returning();

      await tx.insert(indirizzo).values({
        cap: input.cap,
        comune: input.comune,
        indirizzo: input.indirizzo,
        provincia: input.provincia,
        default: true,
        userId: user.id,
      });

      await tx.update(dbUser).set({
        onboarded: true,
        cassa: input.cassa as UserCassaType,
        nome: input.nome,
        cognome: input.cognome,
        dataDiNascita: new Date(input.dataDiNascita),
      }).where(eq(dbUser.id, user.id));

      return { success: true };
    }
    catch (e) {
      console.error(e);
    }
  });
  if (!transaction?.success)
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione utente");

  const customer = await stripe.customers.create({
    email: user.email,
    name: `${input.nome} ${input.cognome}`,
  });

  if (!customer.id)
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione cliente");

  const plan = getPlanByLabel("Free");

  if (!plan)
    throw new ZSAError("NOT_FOUND", "Piano non trovato");

  const newSub = await initFreePlan(plan.price.monthly.id, { id: user.id, email: user.email, customerId: customer.id });
  if (!newSub.id)
    throw new ZSAError("UNPROCESSABLE_CONTENT", "Errore creazione abbonamento");

  await auth.api.updateUser({
    body: {
      onboarded: true,
      customerId: customer.id,
      cassa: input.cassa as UserCassaType,
      name: `${input.nome} ${input.cognome}`,
      nome: input.nome,
      cognome: input.cognome,
      dataDiNascita: new Date(input.dataDiNascita),
    },
    headers: await headers(),
  });

  revalidatePath("/", "layout");
});
