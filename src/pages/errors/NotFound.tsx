import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectRole,
} from "../../features/auth/authSlice";
import type { Role } from "@/types/role";
import { Button } from "@/components/ui/button";

const roleHomePageMap: Record<Role, string> = {
  ADMIN: "/admin_dashboard",
  HR: "/hr_dashboard",
  DOCTOR: "/doctor_dashboard",
  EMPLOYEE: "/employee_dashboard",
};

export function NotFound() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole);

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Button
        onClick={() => {
          console.log("clicked");
          if (isAuthenticated && role) {
            navigate(roleHomePageMap[role], { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        }}
      >
        Go back to dashboard
      </Button>
    </div>
  );
}
