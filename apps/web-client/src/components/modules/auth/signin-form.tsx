"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/ui/button";
import { CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { Form } from "@repo/ui/components/ui/form";
import { FormFields } from "@repo/ui/components/ui/form-fields";
import { Separator } from "@repo/ui/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { mockLoginValues } from "@/lib/mock/login-mock";

export const SigninFormSchema = z.object({
  email: z.string().email(),
});

export function SigninForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof SigninFormSchema>>({
    resolver: zodResolver(SigninFormSchema),
    /* eslint-disable-next-line node/no-process-env */
    defaultValues: process.env.NODE_ENV !== "production" ? mockLoginValues : undefined,
  });

  async function handleSave(values: z.infer<typeof SigninFormSchema>) {
    startTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      }, {
        onSuccess: () => {
          toast.success("Email inviata con successo");
          router.push(`/verify?email=${Buffer.from(values.email).toString("base64")}&type=sign-in`);
        },
      });
      if (error) {
        console.error(error);
        toast.error("Errore nell'invio dell'email");
      }
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)}>
        <CardContent className="space-y-2">
          <Button type="button" className="w-full" variant="outline" size="sm">
            <Image src="https://img.clerk.com/static/google.svg?width=160" alt="Accedi con Google" height={160} width={160} className="size-4" />
            Accedi con Google
          </Button>
          <div className="flex w-full items-center gap-2 py-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">oppure</span>
            <Separator className="flex-1" />
          </div>
          <FormFields.Input name="email" placeholder="Indirizzo Email" label="Indirizzo Email" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button loading={isPending} type="submit" className="w-full">
            Continua
            <ArrowRight />
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
