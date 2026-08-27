import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectIsCheckingAuth,
} from "@/features/auth/authSlice";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { NotificationBell } from "@/components/common/NotificationBell";
import { NotificationStream } from "@/features/notification/NotificationStream";
import { PageLoader } from "../common/page-loader";

export function AuthenticatedLayout() {
  const isChecking = useAppSelector(selectIsCheckingAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isChecking) {
    return <PageLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <NotificationStream />
      <AppSidebar />
      <main className="w-full min-h-screen flex-1 p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <SidebarTrigger />
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
