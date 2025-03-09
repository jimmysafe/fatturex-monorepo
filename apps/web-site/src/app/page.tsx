import { Benefits } from "@/components/benefits";
import { Casse } from "@/components/casse";
import { Faq } from "@/components/faq";
import { Flow } from "@/components/flow";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Testimonial } from "@/components/testimonial";

export default function Home() {
  return (
    <main>
      <Hero />
      <Casse />
      <Flow />
      <Benefits />
      <Testimonial />
      <Pricing />
      <Faq />
    </main>
  );
}
