import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectRole,
} from "../../features/auth/authSlice";
import { type Role } from "@/types/role";

const roleHomePageMap: Record<Role, string> = {
  ADMIN: "/admin_dashboard",
  HR: "/hr_dashboard",
  DOCTOR: "/doctor_dashboard",
  EMPLOYEE: "/employee_dashboard",
};

export function UnauthenticatedLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole);

  if (isAuthenticated && role) {
    return <Navigate to={roleHomePageMap[role]} replace />;
  }

  return <Outlet />;
}
