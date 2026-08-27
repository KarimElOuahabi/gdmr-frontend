import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectRole,
} from "../../features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { roleHomePageMap } from "@/lib/roleHomePageMap";
import { ErrorPage } from "./ErrorPage";

export function Forbidden() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole);
  const isLoggedIn = isAuthenticated && role;

  const goHome = () => {
    if (isLoggedIn) {
      navigate(roleHomePageMap[role], { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <ErrorPage
      icon={ShieldAlert}
      iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      code="403"
      title="Access denied"
      description="You don't have permission to access this resource."
      actions={
        <Button onClick={goHome}>
          {isLoggedIn ? "Go back to dashboard" : "Go back to login"}
        </Button>
      }
    />
  );
}
