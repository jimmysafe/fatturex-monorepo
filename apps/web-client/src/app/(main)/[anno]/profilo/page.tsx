import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import Link from "next/link";

import { IndirizziCard } from "@/components/modules/impostazioni/indirizzi-card";
import { ThemeSettingsCard } from "@/components/modules/impostazioni/theme-settings-card";
import { AbbonamentoCard } from "@/components/modules/profilo/abbonamento-card";
import { ContabilitaList } from "@/components/modules/profilo/contabilita-list";
import { PartitaIvaCard } from "@/components/modules/profilo/partita-iva-card";
import { ProfiloCard } from "@/components/modules/profilo/profilo-card";

export default async function ProfiloPage(props: { searchParams: Promise<{ [x: string]: string }> }) {
  const search = await props.searchParams;
  const tab = search.tab;

  return (
    <div className="container max-w-5xl">
      <div className="mb-8 flex items-center">
        {/* <Button variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button> */}
        <h1 className="text-3xl font-bold">Impostazioni e Profilo</h1>
      </div>

      <Tabs defaultValue={tab || "profilo"}>
        <div className="scrollbar-none mb-8 overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="profilo">
              <Link href="?tab=profilo">
                Profilo
              </Link>
            </TabsTrigger>
            <TabsTrigger value="indirizzi">
              <Link href="?tab=indirizzi">
                Indirizzi
              </Link>
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Link href="?tab=branding">
                Branding
              </Link>
            </TabsTrigger>
            <TabsTrigger value="abbonamento">
              <Link href="?tab=abbonamento">
                Abbonamento
              </Link>
            </TabsTrigger>
            <TabsTrigger value="contabilita">
              <Link href="?tab=contabilita">
                Contabilità
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent md:hidden" />

        <TabsContent value="profilo">
          <div className="space-y-6">
            <ProfiloCard />
            <PartitaIvaCard />
          </div>
        </TabsContent>

        <TabsContent value="indirizzi">
          <IndirizziCard />
        </TabsContent>

        <TabsContent value="branding">
          <ThemeSettingsCard />
        </TabsContent>

        <TabsContent value="abbonamento">
          <AbbonamentoCard />
        </TabsContent>

        <TabsContent value="contabilita">
          <ContabilitaList />
        </TabsContent>
      </Tabs>

    </div>
  );
}
