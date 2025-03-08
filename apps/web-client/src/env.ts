/* eslint-disable node/no-process-env */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.string().default(process.env.VERCEL_ENV || "development"),
    DATABASE_URL: z.string().default("file:./dev.db"),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().default("secret"),
    RESEND_API_KEY: z.string().min(1),
    OPENAPI_API_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STS_URL: z.string().min(1),
    STS_CERTIFICATE: z.string().min(1),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    KV_REST_API_TOKEN: z.string().min(1),
    KV_REST_API_URL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().default(
      process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`
        : "http://localhost:3000",
    ),
    NEXT_PUBLIC_BUCKET_URL: z.string().min(1),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    APP_ENV: process.env.APP_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    OPENAPI_API_KEY: process.env.OPENAPI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STS_URL: process.env.STS_URL,
    STS_CERTIFICATE: process.env.STS_CERTIFICATE,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    NEXT_PUBLIC_BUCKET_URL: process.env.NEXT_PUBLIC_BUCKET_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
  },
});
