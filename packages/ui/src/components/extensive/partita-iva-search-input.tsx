import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { RotateCw, XIcon } from "lucide-react";

type PartitaIvaSearchInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> & {
  description?: string;
};

export function PartitaIvaSearchInput({ className, placeholder = "Cerca", ...rest }: PartitaIvaSearchInputProps) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name="partitaIva"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Numero Partita IVA</FormLabel>
          <FormControl>
            <div className={cn("flex items-center pr-2 h-9 w-full rounded-md border border-input bg-transparent", className)}>
              <Input
                type="text"
                className={cn("!border-none !ring-0 !outline-none !shadow-none")}
                {...rest}
                {...field}
                value={field.value || ""}
              />
              {form.formState.isValidating ? (
                <RotateCw className="size-5 animate-spin text-primary" />
              ) : form.formState.errors.partitaIva ? (
                <XIcon className="size-5 text-destructive" />
              ) : <></>}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
