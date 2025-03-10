import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";

export function Logo({ iconOnly = true, ...props }: { className?: string; iconOnly?: boolean; white?: boolean }) {
  if (iconOnly)
    return <Svg {...props} />;

  return (
    <div className="flex items-center gap-2">
      <Svg {...props} />
      <p className="font-bold">Fatturex</p>
    </div>
  );
}

function Svg(props: { white?: boolean; className?: string }) {
  return (
    <Image
      src={props.white ? "/assets/logo-white.svg" : "/assets/logo.svg"}
      width={150}
      height={150}
      className={cn("size-10", props.className)}
      alt="Fatturex Logo"
    />
  );
}
