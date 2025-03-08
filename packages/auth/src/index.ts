import { sendOtpSigninEmail } from "@repo/auth/lib/send-otp-email";
import { db } from "@repo/database/client";
import { getUserPublicDetails } from "@repo/database/queries/user";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { customSession, emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  advanced: {
    cookiePrefix: "fatturex",
    // crossSubDomainCookies: {
    // 	enabled: true,
    // },
    // defaultCookieAttributes: {
    // 	sameSite: 'none',
    // 	secure: true,
    // },
  },
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
