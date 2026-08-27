import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  unauthenticatedRoutes,
  authenticatedRoutes,
  fallbackRoutes,
} from "./routes";
import { RootErrorBoundary } from "../pages/errors/RootErrorBoundary";

const router = createBrowserRouter([
  {
    errorElement: <RootErrorBoundary />,
    children: [...unauthenticatedRoutes, ...authenticatedRoutes],
  },
  ...fallbackRoutes,
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
