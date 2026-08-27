import { type LucideIcon } from "lucide-react";

interface ProfileInfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function DataItem({
  icon: IconComponent,
  label,
  value,
}: ProfileInfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-300 dark:bg-zinc-800/70 dark:text-zinc-300">
        <IconComponent className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
