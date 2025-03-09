const ITEMS = [
  {
    name: "Mercury",
    src: "https://shadcnblocks.com/images/block/mainline/logos/mercury.svg",
    width: 143,
    height: 26,
    href: "https://mercury.com",
  },
  {
    name: "Watershed",
    src: "https://shadcnblocks.com/images/block/mainline/logos/watershed.svg",
    width: 154,
    height: 31,
    href: "https://watershed.com",
  },
  {
    name: "Retool",
    src: "https://shadcnblocks.com/images/block/mainline/logos/retool.svg",
    width: 113,
    height: 22,
    href: "https://retool.com",
  },
  {
    name: "Descript",
    src: "https://shadcnblocks.com/images/block/mainline/logos/descript.svg",
    width: 112,
    height: 27,
    href: "https://descript.com",
  },
  {
    name: "Perplexity",
    src: "https://shadcnblocks.com/images/block/mainline/logos/perplexity.svg",
    width: 141,
    height: 32,
    href: "https://perplexity.ai",
  },
  {
    name: "Monzo",
    src: "https://shadcnblocks.com/images/block/mainline/logos/monzo.svg",
    width: 104,
    height: 18,
    href: "https://monzo.com",
  },
  {
    name: "Ramp",
    src: "https://shadcnblocks.com/images/block/mainline/logos/ramp.svg",
    width: 105,
    height: 28,
    href: "https://ramp.com",
  },
  {
    name: "Raycast",
    src: "https://shadcnblocks.com/images/block/mainline/logos/raycast.svg",
    width: 128,
    height: 33,
    href: "https://raycast.com",
  },
  {
    name: "Arc",
    src: "https://shadcnblocks.com/images/block/mainline/logos/arc.svg",
    width: 90,
    height: 28,
    href: "https://arc.com",
  },
];

export function Casse() {
  return (
    <section className="overflow-hidden bg-muted py-32 dark:bg-muted">
      <div className="container text-center">
        <h2 className="text-balance text-xl font-semibold tracking-tight lg:text-3xl">
          Powering the world&apos;s best product teams.
          <br />
          <span className="text-muted-foreground">
            From next-gen startups to established enterprises.
          </span>
        </h2>
      </div>

      <div className="relative mt-10">
        <div className="flex w-full">
          {/* First marquee group */}
          <div className="flex shrink-0 animate-marquee items-center gap-12">
            {ITEMS.map((logo, index) => (
              <a href={logo.href} target="_blank" key={index} className="p-6">
                <img
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain transition-opacity hover:opacity-70"
                />
              </a>
            ))}
          </div>
          {/* Second marquee group */}
          <div className="flex shrink-0 animate-marquee items-center gap-12">
            {ITEMS.map((logo, index) => (
              <a href={logo.href} target="_blank" key={index} className="p-6">
                <img
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain transition-opacity hover:opacity-70"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
