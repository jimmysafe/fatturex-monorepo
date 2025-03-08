import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { notFound } from "next/navigation";

import { Logo } from "@/components/common/logo";
import { VerifyOtpForm } from "@/components/modules/auth/verify-otp-form";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; type?: string }> }) {
  const { email, type } = await searchParams;

  if (!email || !type)
    return notFound();

  return (
    <Card className="mx-auto w-full max-w-[400px] p-4">
      <CardHeader className="items-center gap-4">
        <Logo />
        <div className="space-y-2 text-center">
          <CardTitle>
            Verifica Identitá
          </CardTitle>
          <CardDescription>
            Inserisci il codice OTP inviato alla tua email
          </CardDescription>
        </div>
      </CardHeader>
      <VerifyOtpForm email={email} type={type} />
    </Card>
  );
}
