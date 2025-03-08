/* eslint-disable node/no-process-env */
import type { z } from "zod";

import { faker } from "@faker-js/faker";

import type { SigninFormSchema } from "@/components/modules/auth/signin-form";

export const mockLoginValues = process.env.APP_ENV !== "production" ? {
  email: faker.internet.email(),
} satisfies z.infer<typeof SigninFormSchema> : undefined;
