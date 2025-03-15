import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

import { IndirizziCard } from "@/components/modules/impostazioni/indirizzi-card";
import { ThemeSettingsCard } from "@/components/modules/impostazioni/theme-settings-card";
import { AbbonamentoCard } from "@/components/modules/profilo/abbonamento-card";
import { ContabilitaList } from "@/components/modules/profilo/contabilita-list";
import { PartitaIvaCard } from "@/components/modules/profilo/partita-iva-card";
import { ProfiloCard } from "@/components/modules/profilo/profilo-card";

export default function ProfiloPage() {
  return (
    <div className="container max-w-5xl">
      <div className="mb-8 flex items-center">
        {/* <Button variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button> */}
        <h1 className="text-3xl font-bold">Impostazioni e Profilo</h1>
      </div>

      <Tabs defaultValue="profilo">
        <TabsList className="mb-8">
          <TabsTrigger value="profilo">Profilo</TabsTrigger>
          <TabsTrigger value="indirizzi">Indirizzi</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="abbonamento">Abbonamento</TabsTrigger>
          <TabsTrigger value="contabilita">Contabilità</TabsTrigger>
        </TabsList>

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
