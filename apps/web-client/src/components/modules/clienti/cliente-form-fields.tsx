"use client";
import { useFormContext } from "react-hook-form";

import { CreateClienteSchema } from "@repo/database/schema";
import { nazioni } from "@repo/shared/nazioni";
import { province } from "@repo/shared/province";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { z } from "zod";

export const ClienteSchema = CreateClienteSchema.extend({
  isPersona: z.boolean().optional().default(false),
  isEstero: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if (data.isPersona) {
    if (!data.nome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome obbligatorio",
        path: ["nome"],
      });
    }
    if (!data.cognome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cognome obbligatorio",
        path: ["cognome"],
      });
    }
  }
  else {
    if (!data.ragioneSociale) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ragione sociale obbligatoria",
        path: ["ragioneSociale"],
      });
    }
  }
  if (data.isEstero) {
    if (!data.paese) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paese obbligatorio",
        path: ["paese"],
      });
    }
  }
  else {
    if (!data.cap) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CAP obbligatorio",
        path: ["cap"],
      });
    }
    if (!data.comune) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Comune obbligatorio",
        path: ["comune"],
      });
    }
  }
});

export function ClienteFormFields() {
  const form = useFormContext<z.infer<typeof ClienteSchema>>();

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <FormFields.Checkbox name="isPersona" label="Questo cliente é una persona fisica." />
        <FormFields.Checkbox name="isEstero" label="Cliente Estero." />
      </div>
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Dettagli</h3>
        <div className="space-y-2">
          {form.watch("isPersona")
            ? (
                <>
                  <FormFields.Input name="nome" label="Nome" />
                  <FormFields.Input name="cognome" label="Cognome" />
                </>
              )
            : (
                <FormFields.Input name="ragioneSociale" label="Ragione Sociale" />
              )}
          <FormFields.Input name="partitaIva" label="Partita IVA" />
          {!form.watch("isEstero") && (
            <>
              <FormFields.Input name="codiceFiscale" label="Codice Fiscale" normalize="uppercase" />
              <FormFields.Input name="codiceDestinatario" label="Codice Destinatario (SDI)" />
            </>
          )}
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Contatti</h3>
        <div className="space-y-2">
          <FormFields.Input type="email" name="indirizzoEmail" label="Indirizzo Email" />
          {!form.watch("isEstero") && (
            <FormFields.Input type="email" name="indirizzoPec" label="Indirizzo PEC" />
          )}
          <FormFields.Input name="telefono" label="Telefono" />
          <FormFields.Input name="telefonoFisso" label="Telefono Fisso" />
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Indirizzo</h3>
        <div className="space-y-2">
          <FormFields.Input name="indirizzo" label={form.watch("isEstero") ? "Indirizzo Completo" : "Indirizzo e Civico"} />
          {form.watch("isEstero")
            ? (
                <FormFields.Select name="paese" label="Paese" options={nazioni} />
              )
            : (
                <>
                  <FormFields.Input name="cap" label="CAP" />
                  <FormFields.Input name="comune" label="Comune" />
                  <FormFields.Select name="provincia" label="Provincia" options={province} />
                </>
              )}

        </div>
      </section>
    </form>
  );
}
