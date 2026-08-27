import type { Role } from "@/types/role";

export const roleHomePageMap: Record<Role, string> = {
  ADMIN: "/admin_dashboard",
  HR: "/hr_dashboard",
  DOCTOR: "/doctor_dashboard",
  EMPLOYEE: "/employee_dashboard",
};
