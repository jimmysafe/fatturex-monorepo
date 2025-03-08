import { Button } from "@repo/ui/components/ui/button";
import { DEFAULT_NUMBER_OF_INVOICES } from '@repo/shared/plans'
import { db } from "@/db";

export default async function Home() {

  const a = await db.query.fattura.findMany()
  console.log(a)

  return (
    <main>
      <p>{DEFAULT_NUMBER_OF_INVOICES }</p>
      <Button>HELLO</Button>
    </main>
  );
}
