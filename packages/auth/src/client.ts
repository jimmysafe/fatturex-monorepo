/* eslint-disable node/no-process-env */
import type { auth } from "@repo/auth";

import { customSessionClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), customSessionClient<typeof auth>()],
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});
