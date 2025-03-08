import { z } from "zod";

export const IdParamSchema = z.object({
  id: z.string().uuid().min(1).max(36),
});

export const YearParamSchema = z.object({
  anno: z.string().min(4).max(4),
});
