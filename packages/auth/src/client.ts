/* eslint-disable node/no-process-env */
import { customSessionClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as dotenv from "dotenv";
import { toast } from "sonner";

import type { AuthClient } from ".";

dotenv.config();

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), customSessionClient<AuthClient>()],
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});
