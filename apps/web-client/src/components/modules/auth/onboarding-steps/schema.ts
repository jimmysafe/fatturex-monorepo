import { codiceFiscaleRegex, partitaIvaRegex } from "@repo/shared/regex";
import { z } from "zod";

export const OnboardingSchema = z.object({
  partitaIva: z.string().regex(partitaIvaRegex).min(1),
  cassa: z.string().min(1),
  codiceAteco: z.string().min(1),
  dataApertura: z.coerce.date(),
  indirizzo: z.string().min(1),
  citta: z.string().min(1),
  cap: z.string().min(1),
  comune: z.string().min(1),
  provincia: z.string().min(1),
  nome: z.string().min(1),
  cognome: z.string().min(1),
  codiceFiscale: z.string().regex(codiceFiscaleRegex).min(1),
  dataDiNascita: z.coerce.date().optional(),
  dataIscrizioneCassa: z.coerce.date().optional(),
});
