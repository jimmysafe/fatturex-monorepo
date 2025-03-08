import { DEFAULT_NUMBER_OF_INVOICES } from "@repo/shared/plans";
import { Button } from "@repo/ui/components/ui/button";

export default async function Home() {
  return (
    <main>
      <p>{DEFAULT_NUMBER_OF_INVOICES}</p>

      <Button>HELLO</Button>
    </main>
  );
}
