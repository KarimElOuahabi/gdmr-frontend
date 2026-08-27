import type { KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  className?: string;
  isLoading?: boolean;
  /** When provided, the whole card becomes a keyboard-accessible button that navigates. */
  onClick?: () => void;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className = "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  isLoading = false,
  onClick,
}: StatCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      size="sm"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={
        onClick
          ? "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          : undefined
      }
    >
      <CardContent className="flex items-center gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${className}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-5 w-20" />
          ) : (
            <p className="truncate text-lg font-semibold">{value}</p>
          )}
          {hint && !isLoading && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
