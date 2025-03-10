import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";

export function Testimonial() {
  return (
    <section className="bg-accent px-4 py-32">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex items-center rounded-full bg-background p-1 shadow-md">
            <Avatar className="size-10">
              <AvatarImage src="https://shadcnblocks.com/images/block/avatar-1.webp" />
              <AvatarFallback>SB</AvatarFallback>
            </Avatar>
            <Avatar className="-ml-3 size-10">
              <AvatarImage src="https://shadcnblocks.com/images/block/avatar-3.webp" />
              <AvatarFallback>RA</AvatarFallback>
            </Avatar>
            <Avatar className="-ml-3 size-10">
              <AvatarImage src="https://shadcnblocks.com/images/block/avatar-2.webp" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="mx-2 text-xs font-medium">
              Oltre 1000+ professionisti si fidano di noi
            </div>
          </div>
          <p className="max-w-4xl text-xl font-medium lg:text-2xl">
            &ldquo;Gestire le fatture era sempre stato un incubo per me. Da quando uso Fatturex, non solo risparmio tempo prezioso nella creazione delle fatture, ma ho anche un controllo totale sul mio fatturato. La dashboard è intuitiva e mi permette di vedere subito quanto ho guadagnato e quanto devo accantonare per le tasse. È stato un vero game-changer per la mia attività.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
