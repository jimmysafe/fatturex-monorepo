import { auth } from "@repo/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main>
      <pre>{ JSON.stringify(session, null, 2)}</pre>
    </main>
  );
}
