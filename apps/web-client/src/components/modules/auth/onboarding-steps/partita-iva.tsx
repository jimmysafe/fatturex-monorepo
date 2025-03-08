import { useFormContext } from "react-hook-form";

import { casse } from "@repo/database/lib/casse";
import { UserCassa } from "@repo/database/lib/enums";
import { partitaIvaRegex } from "@repo/shared/regex";
import { PartitaIvaSearchInput } from "@repo/ui/components/extensive/partita-iva-search-input";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { z } from "zod";

import { checkExistingPartitaIva } from "@/server/actions/partita-iva";

import { CodiceAtecoSelectModal } from "./components/codice-ateco-select-modal";
import { OnboardingSchema } from "./schema";

export const OnboardingPartitaIvaSchema = OnboardingSchema
  .pick({ partitaIva: true, cassa: true, codiceAteco: true, dataApertura: true, dataIscrizioneCassa: true })
  .extend({
    partitaIva: z.string()
      .min(1, "Campo obbligatorio")
      .refine(
        val => partitaIvaRegex.test(val),
        { message: "Formato Partita IVA non valido" },
      )
      .refine(
        async (val) => {
          if (!partitaIvaRegex.test(val))
            return false;
          const [result] = await checkExistingPartitaIva({ numero: val });
          return !result?.exists; // return false if partita IVA exists
        },
        { message: "Partita IVA già registrata" },
      ),
  })
  .superRefine((data, ctx) => {
    if (data.cassa === UserCassa.CASSA_FORENSE && !data.dataIscrizioneCassa) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataIscrizioneCassa"],
        message: "Campo Obbligatorio",
      });
    }
  });

function getYears() {
  const currentYear = new Date().getFullYear();
  const yearsCount = currentYear - 1973 + 1;

  return Array.from({ length: yearsCount }, (_, i) => {
    const year = currentYear - i;
    return {
      label: year.toString(),
      value: new Date(year, 1, 1).toISOString(),
    };
  });
}

export function PartitaIva() {
  const form = useFormContext();
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <PartitaIvaSearchInput />
        <FormFields.Select name="cassa" label="Cassa di Appartenenza" options={casse} />
        <FormFields.Select name="dataApertura" label="Anno Apertura Partita IVA" description="L'anno in cui hai aperto la Partita IVA" options={getYears()} />
        {form.watch("cassa") === UserCassa.CASSA_FORENSE && (
          <FormFields.Select name="dataIscrizioneCassa" label="Anno di iscrizione" description="L'anno di iscrizione alla Cassa Forense." options={getYears()} />
        )}
        <div>
          <CodiceAtecoSelectModal onConfirm={c => form.setValue("codiceAteco", c)} defaultSelected={form.watch("codiceAteco")} />
        </div>
      </CardContent>
    </Card>
  );
}
