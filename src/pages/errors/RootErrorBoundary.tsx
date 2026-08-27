import {
  useRouteError,
  isRouteErrorResponse,
  Navigate,
} from "react-router-dom";
import { NotFound } from "./NotFound";
import { Forbidden } from "./Forbidden";
import { ServerError } from "./ServerError";

export function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }

    if (error.status === 401) {
      return <Navigate to="/login" replace />;
    }

    if (error.status === 403) {
      return <Forbidden />;
    }

    return <ServerError status={error.status} />;
  }

  return <ServerError />;
}
