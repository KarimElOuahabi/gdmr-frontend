import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedArrowsProps {
  size?: 5 | 6 | 8 | 10 | 12;
  className?: string;
}

export function AnimatedArrows({ size = 5, className }: AnimatedArrowsProps) {
  const sizeClasses = {
    5: "h-5 w-5 -ml-3",
    6: "h-6 w-6 -ml-3.5",
    8: "h-8 w-8 -ml-5",
    10: "h-10 w-10 -ml-6",
    12: "h-12 w-12 -ml-7",
  };

  const arrowClass = cn("first:ml-0", sizeClasses[size]);

  return (
    // Removed ALL color classes from this component
    <div className={cn("flex items-center", className)}>
      <ChevronRight className={cn(arrowClass, "animate-arrow-1")} />
      <ChevronRight className={cn(arrowClass, "animate-arrow-2")} />
      <ChevronRight className={cn(arrowClass, "animate-arrow-3")} />
    </div>
  );
}
