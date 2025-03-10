import type { z } from "zod";

import { faker } from "@faker-js/faker";

import type { SigninFormSchema } from "@/components/modules/auth/signin-form";

export const mockLoginValues = {
  email: faker.internet.email(),
} satisfies z.infer<typeof SigninFormSchema>;
