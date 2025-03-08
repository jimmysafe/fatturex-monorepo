"use client";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import { CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import { signInOtp } from "@/server/actions/auth";

const VerifyFormSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export function VerifyOtpForm(
  { email, type }: { email: string; type: string },
) {
  const { execute: signIn, isPending } = useServerAction(signInOtp, {
    onSuccess() {
      toast.success("Benvenuto!");
    },
    onError: ({ err }) => toast.error(err.message),
  });
  const form = useForm<z.infer<typeof VerifyFormSchema>>({
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: {
      email: email ? Buffer.from(email, "base64").toString() : undefined,
    },
  });

  async function handleSave(values: z.infer<typeof VerifyFormSchema>) {
    if (type === "sign-in") {
      await signIn(values);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)}>
        <CardContent>
          <FormFields.InputOtp name="otp" />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button loading={isPending} className="flex-1" type="submit">
            Verifica
            <ArrowRight />
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
