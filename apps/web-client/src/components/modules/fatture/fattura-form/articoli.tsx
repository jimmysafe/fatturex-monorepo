"use client";
import { useFieldArray, useFormContext } from "react-hook-form";

import { CreateFatturaSchema } from "@repo/database/schema";
import { Button } from "@repo/ui/components/ui/button";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { Separator } from "@repo/ui/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { z } from "zod";

import { FatturaTemplateSelectModal } from "../fattura-template-select-modal";

export const FatturaArticoliSchema = CreateFatturaSchema
  .pick({ articoli: true })
  .extend({
    articoli: z.array(z.object({
      descrizione: z.string().min(1, "Campo obbligatorio"),
      quantita: z.number().int().min(1, "Deve essere maggiore di 0"),
      prezzo: z.union([
        z.string().min(1, "Campo obbligatorio"),
        z.number().min(0, "Deve essere maggiore o uguale a 0"),
      ]),
    })),
    saveAsTemplate: z.boolean().default(false),
    templateName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.saveAsTemplate && !data.templateName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["templateName"],
        message: "Campo Obbligatorio",
      });
    }
  },
  );

export function Articoli() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "articoli",
  });

  const isEditing = !!form.watch("id");

  return (
    <section className="space-y-4">
      {!isEditing && (
        <>
          <div>
            <FatturaTemplateSelectModal />
          </div>
          <div className="mx-auto flex w-full max-w-sm items-center gap-2 py-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">oppure inserisci manualmente</span>
            <Separator className="flex-1" />
          </div>
        </>
      )}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative space-y-2 border-l-2 border-primary pl-4 pt-6">
            <div className="absolute left-0 top-0 flex aspect-square size-6 items-center justify-center rounded-r-sm bg-primary text-sm text-primary-foreground">{ index + 1}</div>
            <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)} className="absolute right-0 top-5 text-xs text-muted-foreground">
              Rimuovi
            </Button>
            <FormFields.TextArea name={`articoli.${index}.descrizione`} label="Descrizione" />
            <div className="flex gap-2">
              <FormFields.Input type="number" name={`articoli.${index}.quantita`} label="Quantità" />
              <FormFields.Input type="number" name={`articoli.${index}.prezzo`} label="Prezzo" />
            </div>
          </div>
        ))}
        <Button type="button" size="sm" variant="ghost" onClick={() => append({ descrizione: "", quantita: 1, prezzo: 0 })}>
          <PlusCircle />
          Aggiungi
        </Button>
      </div>
      {!isEditing && (
        <>
          <Separator />
          <div className="space-y-4 px-4">
            <FormFields.Checkbox
              name="saveAsTemplate"
              label="Salva come template per riutilizzarlo in futuro"
              description="Seleziona questa opzione se usi spesso questi articoli nelle tue fatture"
            />
            {form.watch("saveAsTemplate") && (
              <FormFields.Input name="templateName" placeholder="Dai un nome a questo template" />
            )}
          </div>
        </>
      )}
    </section>
  );
}
