import Image from "next/image";

import { cn } from "@repo/ui/lib/utils";

export function Logo({ iconOnly = true, ...props }: { className?: string; iconOnly?: boolean }) {
  if (iconOnly)
    return <Svg {...props} />;

  return (
    <div className="flex items-center gap-2">
      <Svg {...props} />
      <p className="font-bold">Fatturex</p>
    </div>
  );
}

function Svg(props: { className?: string }) {
  return (
    <Image
      src="/assets/logo.svg"
      width={150}
      height={150}
      className={cn("size-10", props.className)}
      alt="Fatturex Logo"
    />
  );
}
