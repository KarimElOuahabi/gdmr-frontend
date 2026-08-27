import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: number
}

// Comet-style spinner: a rotating gradient ring with a fading tail and a
// pulsing core, in the brand primary color — replaces the plain Loader2 icon.
function Spinner({ className, size = 40 }: SpinnerProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="absolute inset-0 animate-spin rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 55%, var(--primary) 100%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          animationDuration: "1.1s",
        }}
      />
      <div
        className="absolute inset-0 animate-spin rounded-full opacity-40"
        style={{
          background:
            "conic-gradient(from 180deg, transparent 0%, transparent 70%, var(--primary) 100%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          animationDuration: "1.8s",
          animationDirection: "reverse",
        }}
      />
      <div className="absolute inset-0 m-auto size-1.5 animate-pulse rounded-full bg-primary" />
    </div>
  )
}

export { Spinner }
