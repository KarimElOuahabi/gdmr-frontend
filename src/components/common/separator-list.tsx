import { type ReactNode } from "react";

interface SeparatorListProps {
  items: { label: string; value: ReactNode }[];
}

export function SeparatorList({ items }: SeparatorListProps) {
  return (
    <dl className="flex w-full flex-col gap-2.5 text-sm">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
        >
          <dt className="font-medium text-muted-foreground">{item.label}</dt>
          <dd className="text-right font-medium text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
