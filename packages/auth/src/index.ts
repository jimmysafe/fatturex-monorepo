/* eslint-disable node/no-process-env */
import { sendOtpSigninEmail } from "@repo/auth/lib/send-otp-email";
import { db } from "@repo/database/client";
import { getUserPublicDetails } from "@repo/database/queries/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { customSession, emailOTP } from "better-auth/plugins";

const url = process.env.NEXT_PUBLIC_APP_URL;
const baseHost = url?.match(/^https?:\/\/(?:[^:/\s.]+\.)*([^:/\s.]+\.[^:/\s.]+)(:\d+)?/i)?.[1];

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  advanced: {
    cookiePrefix: "fatturex",
    crossSubDomainCookies: {
      enabled: true,
      domain: `.${baseHost}`,
    },
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
  trustedOrigins: [`*.${baseHost}`],
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in")
          await sendOtpSigninEmail(email, otp);
      },
    }),
    customSession(async ({ user, session }) => {
      const dbUser = await getUserPublicDetails({ id: user.id });
      return {
        user: {
          ...user,
          ...dbUser,
        },
        session,
      };
    }),
    nextCookies(), // ! this must be the last element in the array
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set role
      },
      nome: {
        type: "string",
        required: false,
        input: true,
      },
      cognome: {
        type: "string",
        required: false,
        input: true,
      },
      cassa: {
        type: "string",
        required: false,
        input: true,
      },
      onboarded: {
        type: "boolean",
        required: false,
        input: true,
      },
      dataDiNascita: {
        type: "date",
        required: false,
        input: true,
      },
      customerId: {
        type: "string",
        required: false,
        input: true,
      },
      logoPath: {
        type: "string",
        required: false,
        input: true,
      },
      themeColor: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
