import { useEffect, useState } from "react";
import { Input } from "./input";
import { SearchIcon, XIcon } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@repo/ui/lib/utils";

type SearchInputProps = Omit<React.ComponentProps<"input">, 'onChange' | 'value' | 'type'> & {
    onSearch: (value: string) => void;
}

export function SearchInput({ onSearch, className, placeholder = 'Cerca', ...rest }: SearchInputProps) {
    const [value, setValue] = useState<string>(rest.defaultValue as string);
    const debouncedSearch = useDebounce(value, 500);

    useEffect(() => {
        onSearch(debouncedSearch || '');
    }, [debouncedSearch])

    return (
        <div className={cn("flex items-center px-2 h-9 w-full rounded-md border dark:border-muted border-gray-100 bg-transparent", className)}>
            <SearchIcon className="size-4 text-primary" />
            <Input {...rest} type="text" placeholder={placeholder} onChange={e => setValue(e.target.value)} value={value} className={cn('!border-none !ring-0 !outline-none')} />
            {value && <button type="button" onClick={() => setValue('')}>
                <XIcon className="size-4" />
            </button>
            }
        </div>
    )
}