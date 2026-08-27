import { useNavigate } from "react-router-dom";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPage } from "./ErrorPage";

interface ServerErrorProps {
  status?: number;
}

export function ServerError({ status = 500 }: ServerErrorProps) {
  const navigate = useNavigate();

  return (
    <ErrorPage
      icon={ServerCrash}
      iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
      code={String(status)}
      title="Something went wrong"
      description="An unexpected error occurred on our end. Try reloading the page, or head back home."
      actions={
        <>
          <Button onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/", { replace: true })}
          >
            Go back home
          </Button>
        </>
      }
    />
  );
}
