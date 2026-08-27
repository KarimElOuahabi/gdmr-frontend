import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectRole,
} from "../../features/auth/authSlice";
import { roleHomePageMap } from "@/lib/roleHomePageMap";

export function UnauthenticatedLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole);

  if (isAuthenticated && role) {
    return <Navigate to={roleHomePageMap[role]} replace />;
  }

  return <Outlet />;
}
