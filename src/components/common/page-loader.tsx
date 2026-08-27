import { Spinner } from "@/components/ui/spinner";

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={44} />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
