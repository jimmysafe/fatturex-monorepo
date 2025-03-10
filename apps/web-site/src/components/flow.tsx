import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";

import { container } from "@/lib/container";

export function Flow() {
  return (
    <section id="flow" className={cn("py-12 md:py-24", container)}>
      <div className="lg:container">
        <div className="mb-16 max-w-xl px-8 lg:px-0">
          <Badge variant="outline">Come funziona</Badge>
          <h2 className="mb-3 mt-6 text-balance text-2xl font-medium md:text-4xl">
            Un gestionale facile, preciso e affidabile.
          </h2>
          <p>
            Fatturazione elettronica e invio al sistema tessera sanitaria.
            <br />
            Tutto incluso e automatico.
          </p>
        </div>
        <div>
          <Tabs defaultValue="tab-1">
            <TabsList className="relative grid items-start gap-6 lg:grid-cols-4">
              <div className="absolute left-4 right-0 top-[30px] -z-10 hidden h-px bg-input lg:block"></div>
              <TabsTrigger
                value="tab-1"
                className="group pointer-events-none lg:pointer-events-auto"
              >
                <div className="flex gap-4 rounded-md px-8 py-4 text-left hover:bg-muted lg:block lg:px-4">
                  <div className="flex flex-col items-center lg:contents">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-xs font-medium lg:group-data-[state=active]:bg-primary lg:group-data-[state=active]:text-background lg:group-data-[state=active]:ring lg:group-data-[state=active]:ring-muted-foreground/40">
                      1
                    </span>
                    <span className="h-full w-px bg-input lg:hidden"></span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium lg:mt-4">
                      Algoritmo
                    </h3>
                    <p className="text-sm">
                      Un algoritmo preciso al centesimo specifico per cassa previdenziale, verifica la copertura della tua cassa.
                    </p>
                  </div>
                </div>
                <div className="mt-6 block border bg-muted/50 px-4 py-6 lg:hidden">
                  <div className="aspect-video">
                    <Image
                      src="/assets/screenshots/dashboard.png"
                      height={400}
                      width={600}
                      alt="placeholder"
                      className="size-full rounded-md border object-cover shadow"
                    />
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="tab-2"
                className="group pointer-events-none lg:pointer-events-auto"
              >
                <div className="flex gap-4 rounded-md px-8 py-4 text-left hover:bg-muted lg:block lg:px-4">
                  <div className="flex flex-col items-center lg:contents">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-xs font-medium group-data-[state=active]:bg-primary group-data-[state=active]:text-background group-data-[state=active]:ring group-data-[state=active]:ring-muted-foreground/40">
                      2
                    </span>
                    <span className="h-full w-px bg-input lg:hidden"></span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium lg:mt-4">
                      Creazione Fattura Semplificata
                    </h3>
                    <p className="text-sm">
                      Grazie al flusso semplificato, emettere o saldare una fattura non é mai stato così facile.
                    </p>
                  </div>
                </div>
                <div className="mt-6 block border bg-muted/50 px-4 py-6 lg:hidden">
                  <div className="aspect-video">
                    <Image
                      src="/assets/screenshots/nuova-fattura.png"
                      height={400}
                      width={600}
                      alt="placeholder"
                      className="size-full rounded-md border object-cover shadow"
                    />
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="tab-3"
                className="group pointer-events-none lg:pointer-events-auto"
              >
                <div className="flex gap-4 rounded-md px-8 py-4 text-left hover:bg-muted lg:block lg:px-4">
                  <div className="flex flex-col items-center lg:contents">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-xs font-medium group-data-[state=active]:bg-primary group-data-[state=active]:text-background group-data-[state=active]:ring group-data-[state=active]:ring-muted-foreground/40">
                      3
                    </span>
                    <span className="h-full w-px bg-input lg:hidden"></span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium lg:mt-4">
                      Controllo e Visibilitá
                    </h3>
                    <p className="text-sm">
                      Un'interfaccia semplice ed efficace per visualizzare tutte le fatture. Con possibilitá di filtraggio ed esportazione.
                    </p>
                  </div>
                </div>
                <div className="mt-6 block border bg-muted/50 px-4 py-6 lg:hidden">
                  <div className="aspect-video">
                    <Image
                      src="/assets/screenshots/lista-fatture.png"
                      height={400}
                      width={600}
                      alt="placeholder"
                      className="size-full rounded-md border object-cover shadow"
                    />
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="tab-4"
                className="group pointer-events-none lg:pointer-events-auto"
              >
                <div className="flex gap-4 rounded-md px-8 py-4 text-left hover:bg-muted lg:block lg:px-4">
                  <div className="flex flex-col items-center lg:contents">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-xs font-medium group-data-[state=active]:bg-primary group-data-[state=active]:text-background group-data-[state=active]:ring group-data-[state=active]:ring-muted-foreground/40">
                      4
                    </span>
                    <span className="h-full w-px bg-input lg:hidden"></span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium lg:mt-4">
                      Fattura Dettagliata
                    </h3>
                    <p className="text-sm">
                      Dettagli della fattura più limpidi che mai. Notifiche sui prossimi passaggi da completare per avere la fattura in regola al 100%.
                    </p>
                  </div>
                </div>
                <div className="mt-6 block border bg-muted/50 px-4 py-6 lg:hidden">
                  <div className="aspect-video">
                    <Image
                      src="/assets/screenshots/fattura.png"
                      height={400}
                      width={600}
                      alt="placeholder"
                      className="size-full rounded-md border object-cover shadow"
                    />
                  </div>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="mt-10 hidden rounded-xl lg:block">
              <TabsContent value="tab-1" className="aspect-video">
                <Image
                  src="/assets/screenshots/dashboard.png"
                  height={900}
                  width={1400}
                  alt="placeholder"
                  className="size-full rounded-md border object-cover shadow"
                />
              </TabsContent>
              <TabsContent value="tab-2" className="aspect-video">
                <Image
                  src="/assets/screenshots/nuova-fattura.png"
                  height={900}
                  width={1400}
                  alt="placeholder"
                  className="size-full rounded-md border object-cover shadow"
                />
              </TabsContent>
              <TabsContent value="tab-3" className="aspect-video">
                <Image
                  src="/assets/screenshots/lista-fatture.png"
                  height={900}
                  width={1400}
                  alt="placeholder"
                  className="size-full rounded-md border object-cover shadow"
                />
              </TabsContent>
              <TabsContent value="tab-4" className="aspect-video">
                <Image
                  src="/assets/screenshots/fattura.png"
                  height={900}
                  width={1400}
                  alt="placeholder"
                  className="size-full rounded-md border object-cover shadow"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
