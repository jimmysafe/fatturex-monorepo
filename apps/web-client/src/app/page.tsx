import { db } from "@repo/database/client";
import { DEFAULT_NUMBER_OF_INVOICES } from "@repo/shared/plans";
import { Button } from "@repo/ui/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const a = await db.query.fattura.findMany();
  console.log(a)
  return (
    <main>
      <p>{DEFAULT_NUMBER_OF_INVOICES}</p>
      <p>{a.length}</p>
      <Button>HELLO</Button>
    </main>
  );
}
