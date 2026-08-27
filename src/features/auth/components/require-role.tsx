import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { selectRole } from "../authSlice";

export function RequireRole({ allowedRoles }: { allowedRoles: string[] }) {
  const role = useAppSelector(selectRole);
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
