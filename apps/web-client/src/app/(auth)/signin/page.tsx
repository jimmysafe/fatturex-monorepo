import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

import { Logo } from "@/components/common/logo";
import { SigninForm } from "@/components/modules/auth/signin-form";

export default function Signin() {
  return (
    <Card className="mx-auto w-full max-w-[400px] p-4">
      <CardHeader className="items-center gap-4">
        <Logo />
        <div className="space-y-2 text-center">
          <CardTitle>
            Accedi a Fatturex
          </CardTitle>
          <CardDescription className="text-xs">
            Bentornato! Accedi per continuare
          </CardDescription>
        </div>
      </CardHeader>
      <SigninForm />
    </Card>
  );
}
