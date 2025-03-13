"use client";

import type { getAnniContabilita } from "@repo/database/queries/contabilita";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { useParams, usePathname, useRouter } from "next/navigation";

export function AnnoSwitcher(
  props: { anni: Awaited<ReturnType<typeof getAnniContabilita>> },
) {
  const { anno } = useParams<{ anno: string }>();
  const router = useRouter();
  const pathName = usePathname();

  const anniContabilita = props.anni?.map(item => item.anno.toString()) || [];

  function handleChange(newYear: string) {
    const newPath = pathName.split("/").map((segment, index) =>
      index === 1 ? newYear : segment,
    ).join("/");
    router.push(newPath);
  }

  return (
    <Select value={anno} onValueChange={handleChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Anno contabilitá</SelectLabel>
          {anniContabilita.sort((a, b) => Number(b) - Number(a)).map(anno => (
            <SelectItem key={anno} value={`${anno}`}>
              {anno}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
