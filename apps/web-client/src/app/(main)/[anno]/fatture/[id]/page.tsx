import { getFattura } from "@repo/database/queries/fatture";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import { FatturaActions } from "@/components/modules/fatture/fattura-actions";
import { FatturaBadges } from "@/components/modules/fatture/fattura-badges";
import { FatturaConfetti } from "@/components/modules/fatture/fattura-confetti";
import { FatturaIbanAlert } from "@/components/modules/fatture/fattura-iban-alert";
import { FatturaNextSteps } from "@/components/modules/fatture/fattura-next-steps";
import PdfPreview from "@/components/modules/fatture/pdf-preview";
import { _getPartitaIva } from "@/lib/cached/get-partita-iva";
import { _getUserSubscription } from "@/lib/cached/get-subscription";
import { session } from "@/lib/session";

export default async function FatturaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success: string }>;
}) {
  const { success } = await searchParams;
  const { id } = await params;
  const { user } = await session();
  const fattura = await getFattura(id, user.id);

  if (!fattura)
    return notFound();

  const subscriptionPromise = _getUserSubscription();
  const partitaIvaPromise = _getPartitaIva();

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      { success && <FatturaConfetti />}
      <div className="flex items-start justify-between lg:items-center">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <h1 data-testid="page-title" className="text-lg font-bold">
            Fattura
            {" "}
            {fattura.numeroProgressivo}
            {" "}
            /
            {" "}
            {format(fattura.dataEmissione, "yyyy")}
          </h1>
          <FatturaBadges fattura={fattura} />
        </div>
        <FatturaActions fattura={fattura} subscriptionPromise={subscriptionPromise} partitaIvaPromise={partitaIvaPromise} />
      </div>
      <FatturaIbanAlert {...fattura} />
      <FatturaNextSteps fattura={fattura} subscriptionPromise={subscriptionPromise} />
      <div className="overflow-hidden rounded-md shadow-fade">
        <PdfPreview fattura={fattura} />
      </div>
    </section>

  );
}
