import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectRole,
} from "../../features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { roleHomePageMap } from "@/lib/roleHomePageMap";
import { ErrorPage } from "./ErrorPage";

export function NotFound() {
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
      icon={SearchX}
      iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      actions={
        <Button onClick={goHome}>
          {isLoggedIn ? "Go back to dashboard" : "Go back to login"}
        </Button>
      }
    />
  );
}
