import { cn } from "@repo/ui/lib/utils";
import { Timer, Zap, ZoomIn } from "lucide-react";

import { container } from "@/lib/container";

export function Benefits() {
  return (
    <section id="benefits" className={cn("py-12 md:py-24 scroll-mt-20", container)}>
      <div className="container">
        <p className="mb-4 text-sm text-muted-foreground lg:text-base">
          SEMPLICITÀ
        </p>
        <h2 className="max-w-md text-3xl font-medium lg:text-4xl">Semplifica la gestione della tua partita IVA</h2>
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3">
          <div className="rounded-lg bg-accent p-5">
            <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-background">
              <Timer className="size-6" />
            </span>
            <h3 className="mb-2 text-xl font-medium">Affidabilitá</h3>
            <p className="leading-7 text-muted-foreground">
              L'unica piattaforma che ti fornisce in tempo reale l'esatto calcolo fiscale.
              <br />
              Niente più sorprese su quello che dovrai versare l'anno successivo.
            </p>
          </div>
          <div className="rounded-lg bg-accent p-5">
            <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-background">
              <ZoomIn className="size-6" />
            </span>
            <h3 className="mb-2 text-xl font-medium">Precisione</h3>
            <p className="leading-7 text-muted-foreground">
              Un algoritmo preciso al centesimo, preciso per ogni cassa previdenziale.
              <br />
              Un monitoraggio accuratissimo e in tempo reale. Verifica la copertura della tua cassa.
            </p>
          </div>
          <div className="rounded-lg bg-accent p-5">
            <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-background">
              <Zap className="size-6" />
            </span>
            <h3 className="mb-2 text-xl font-medium">Semplicitá</h3>
            <p className="leading-7 text-muted-foreground">
              Invia le tue fatture elettroniche e comunica con il sistema tessera sanitaria.
              <br />
              Tutto in automatico e con un semplice click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
