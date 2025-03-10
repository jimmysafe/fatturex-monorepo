"use client";
import { authClient } from "@repo/auth/client";
import { MultiStepForm } from "@repo/ui/components/extensive/multi-step-form";
import { ThemeToggle } from "@repo/ui/components/extensive/theme-toggle";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { RotateCw, UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

import type { OnboardingSchema } from "@/components/modules/auth/onboarding-steps/schema";

import { Logo } from "@/components/common/logo";
import { GeneralInfo, OnboardingGeneralInfoSchema } from "@/components/modules/auth/onboarding-steps/general-info";
import { Indirizzo, OnboardingIndirizzoSchema } from "@/components/modules/auth/onboarding-steps/indirizzo";
import { Intro } from "@/components/modules/auth/onboarding-steps/intro";
import { OnboardingPartitaIvaSchema, PartitaIva } from "@/components/modules/auth/onboarding-steps/partita-iva";
import { env } from "@/env";
import { getDataDiNascitaFromCf } from "@/lib/get-dob";
import { mockOnboardingValues } from "@/lib/mock/onboarding-mock";
import { onboardUser } from "@/server/actions/auth";

export default function Onboarding() {
  const router = useRouter();
  const { data: userData, isPending: userLoading, refetch } = authClient.useSession();
  const { execute, isPending } = useServerAction(onboardUser, {
    onSuccess: () => {
      refetch();
      router.push(`/payment/plans`);
    },
    onError: ({ err }) => {
      console.error(err);
      toast.error(err.message);
    },
  });

  async function onSubmit(values: z.infer<typeof OnboardingSchema>) {
    await execute({ ...values, dataDiNascita: getDataDiNascitaFromCf(values.codiceFiscale) });
  }

  return (
    <main className="container mx-auto max-w-5xl py-6">
      <nav className="flex justify-between p-4">
        <Logo />
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden">
                {userLoading
                  ? <RotateCw className="animate-spin" />
                  : userData?.user.image
                    ? <Image src={userData.user.image} alt={userData.user.nome || "profilo"} height={100} width={100} className="size-full object-cover" />
                    : <UserIcon />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={async () => {
                await authClient.signOut();
                router.push("/signin");
              }}
              >
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div className="mx-auto my-20 max-w-2xl">
        <MultiStepForm
          variant="default"
          onSubmit={onSubmit}
          onSubmitLoading={isPending}
          defaultValues={env.NODE_ENV !== "production" ? mockOnboardingValues : undefined}
          steps={[
            {
              id: "intro",
              label: "Benvenuto",
              schema: z.any(),
              component: <Intro />,
              descrizione: `Benvenuto nel processo di configurazione del tuo profilo fiscale. \nNei prossimi passaggi ti guideremo attraverso:\n\n• Inserimento dati della Partita IVA\n• Configurazione regime fiscale\n• Impostazione dati anagrafici\n`,
            },
            {
              id: "partita-iva",
              label: "Partita IVA",
              schema: OnboardingPartitaIvaSchema,
              component: <PartitaIva />,
              descrizione: "Inserisci i dati della tua Partita IVA con attenzione.\nQueste informazioni sono essenziali per il corretto calcolo delle imposte e la gestione delle tue fatture.",
            },
            {
              id: "general",
              label: "Informazioni Generali",
              schema: OnboardingGeneralInfoSchema,
              component: <GeneralInfo />,
              descrizione: "Inserisci i tuoi dati personali per completare il profilo. \n I dati inseriti saranno utilizzati per compilare automaticamente i tuoi documenti. Assicurati che siano corretti perché appariranno in tutte le fatture che emetterai.",
            },
            {
              id: "indirizzo",
              label: "Indirizzo",
              schema: OnboardingIndirizzoSchema,
              component: <Indirizzo />,
              descrizione: "Specifica l'indirizzo della tua attività per la corretta compilazione dei documenti. \n Potrai sempre aggiungere più indirizzi in seguito.",
            },
          ]}
        />
      </div>
    </main>
  );
}
