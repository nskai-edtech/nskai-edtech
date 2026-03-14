import type { ElementType } from "react";

type IconComponent = ElementType<{
    className?: string;
    "aria-hidden"?: boolean;
}>;

type DetailCardProps = {
    icon: IconComponent;
    label: string;
    value: string;
};

export function DetailCard({
                               icon: Icon,
                               label,
                               value,
                           }: DetailCardProps) {
    return (
        <div className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <Icon className="w-5 h-5 text-brand" aria-hidden={true} />
            </div>
            <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    {label}
                </p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {value}
                </p>
            </div>
        </div>
    );
}