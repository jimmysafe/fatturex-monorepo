import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getAppUrl } from "@/lib/app-url";
import { container } from "@/lib/container";

const logos = [
  {
    id: "inps",
    description: "INPS",
    image: "/assets/casse/inps.svg",
  },
  {
    id: "enpap",
    description: "enpap",
    image: "/assets/casse/enpap.png",
  },
  {
    id: "enpam",
    description: "enpam",
    image: "/assets/casse/enpam.png",
  },
  {
    id: "enpapi",
    description: "enpapi",
    image: "/assets/casse/enpapi.png",
  },
  {
    id: "inarcassa",
    description: "inarcassa",
    image: "/assets/casse/inarcassa.png",
  },
  {
    id: "cassa-forense",
    description: "cassa forense",
    image: "/assets/casse/cassa-forense.png",
  },
];

export function Casse() {
  return (
    <section className={cn("py-12 md:py-20", container)}>
      <div>
        <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2">
          <div className="my-auto px-6 py-10 sm:px-10 sm:py-12 lg:p-16">
            <div className="w-full md:max-w-md">
              <h2 className="mb-4 text-2xl font-semibold lg:text-3xl">
                Partita IVA a Regime Forfettario
              </h2>
              <p className="mb-6 text-lg">
                Il nostro algoritmo di calcolo, preciso e affidabile, è disponibile per la maggior parte delle casse previdenziali.
              </p>
              <Link href={getAppUrl()}>
                <Button className="w-full md:w-fit">
                  <ArrowRight className="mr-2 size-5" />
                  Inizia Ora
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border md:border-l md:border-t-0">
            {logos.map(logo => (
              <div
                key={logo.id}
                className="-mb-px flex items-center justify-center border-b border-r border-border p-5 sm:p-6 [&:nth-child(3n)]:border-r-0"
              >
                <Image
                  src={logo.image}
                  alt={logo.description}
                  width={300}
                  height={300}
                  className="h-20 w-full object-contain object-center grayscale"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
