import { toast } from "sonner";

import { createCustomerPortalSession } from "@/server/actions/subscriptions";

export async function handleOpenCustomerPortal() {
  const [session] = await createCustomerPortalSession({});
  if (!session?.url)
    return toast.error("Errore apertura portale");
  window.location.href = session.url;
}
