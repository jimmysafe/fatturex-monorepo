import { cn } from "@repo/ui/lib/utils";

type TextRowProps = {
    variant?: 'compact' | 'spaced' | 'stacked';
    label: string,
    value?: string | number | null,
    className?: string
}

export function TextRow({ variant = 'compact', ...props }: TextRowProps) {
    const _variant: Record<typeof variant, string> = {
        compact: 'flex-row items-center gap-2',
        spaced: 'justify-between',
        stacked: 'flex-col'
    }

    return (
        <div className={cn("flex", _variant[variant])}>
            <p className="text-muted-foreground text-sm font-medium">{props.label}:</p>
            <p className={cn("text-sm", props.className)}>{props.value || '-'}</p>
        </div>
    )
}