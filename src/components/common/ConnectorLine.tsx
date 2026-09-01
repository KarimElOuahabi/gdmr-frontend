import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectorLineProps {
  className?: string;
}

// A quiet line-icon-line connector between two related cards (e.g. employee/doctor
// avatars) — replaces the old animated chevrons with something calmer and more formal.
export function ConnectorLine({ className }: ConnectorLineProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="h-px w-8 bg-border sm:w-12" />
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
        <ArrowRight className="h-4 w-4" />
      </div>
      <span className="h-px w-8 bg-border sm:w-12" />
    </div>
  );
}
