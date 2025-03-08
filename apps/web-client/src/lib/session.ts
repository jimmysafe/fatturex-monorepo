"server-only";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

import type { AuthSession, AuthUser } from "@/server/types";

export async function session() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user)
    return unauthorized();
  return session as { session: AuthSession; user: AuthUser };
}
