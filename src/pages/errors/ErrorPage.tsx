import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  icon: LucideIcon;
  iconClassName?: string;
  code: string;
  title: string;
  description: string;
  actions: ReactNode;
}

export function ErrorPage({
  icon: Icon,
  iconClassName,
  code,
  title,
  description,
  actions,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        <Icon className="size-8" />
      </span>
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-widest text-muted-foreground">
          ERROR {code}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions}
      </div>
    </div>
  );
}
