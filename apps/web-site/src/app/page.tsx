import type { Metadata, Viewport } from "next";

import { Benefits } from "@/components/benefits";
import { Casse } from "@/components/casse";
import { Flow } from "@/components/flow";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Testimonial } from "@/components/testimonial";

export const dynamic = "force-static";
export const revalidate = 600;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Fatturex",
  description: "La prima piattaforma che ti permette di gestire le tue fatture ed avere un calcolo preciso delle tasse da pagare.",
  keywords: ["fatture", "tasse", "calcolo", "gestione", "partita iva"],
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Casse />
      <Flow />
      <Testimonial />
      <Pricing />
      <Benefits />
      {/* <Faq /> */}
    </main>
  );
}
