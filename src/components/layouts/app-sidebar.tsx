import { Link, useNavigate } from "react-router-dom";
import { LogOut, Moon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "@/features/auth/authApi";
import { getProfilePopoverRoutes, getSidebarGroups } from "@/routes/routes";
import { useTheme } from "@/hooks/use-theme";

export function AppSidebar() {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar();
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const sidebarGroups = getSidebarGroups(currentUser?.role);
  const profilePopoverRoutes = getProfilePopoverRoutes(currentUser?.role);
  const profilePath = profilePopoverRoutes[0]?.path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent"
              render={
                <a href="/" className="flex items-center justify-center">
                  <img
                    src="/gdmr-logo-full.png"
                    alt="GDMR"
                    className="h-8 w-auto dark:invert group-data-[collapsible=icon]:hidden"
                  />
                  <img
                    src="/gdmr-icon.png"
                    alt="GDMR"
                    className="hidden h-auto w-8 dark:invert group-data-[collapsible=icon]:block"
                  />
                </a>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0.5">
        {sidebarGroups.map((group) => (
          <SidebarGroup
            key={group.label}
            className="py-0.5 group-data-[collapsible=icon]:py-0"
          >
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5 rounded-lg bg-sidebar-accent/60 p-0.5 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
                {group.routes.map((route) => (
                  <SidebarMenuItem key={route.key}>
                    <SidebarMenuButton
                      tooltip={route.label}
                      render={
                        <Link to={route.path} onClick={closeOnMobile}>
                          {route.icon && <route.icon className="size-4" />}
                          <span>{route.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
                {group.label === "General" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={theme === "dark" ? "Light mode" : "Dark mode"}
                      onClick={toggleTheme}
                    >
                      <Moon className="size-4" />
                      <span className="flex-1">Dark mode</span>
                      <Switch
                        checked={theme === "dark"}
                        className="pointer-events-none group-data-[collapsible=icon]:hidden"
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1.5 group-data-[collapsible=icon]:flex-col-reverse group-data-[collapsible=icon]:gap-2.5">
            <SidebarMenuButton
              size="lg"
              tooltip={
                currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : undefined
              }
              className={`min-w-0 flex-1 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:size-9! ${
                profilePath ? "cursor-pointer" : "cursor-default"
              }`}
              render={
                <Link
                  to={profilePath ?? "#"}
                  aria-disabled={!profilePath}
                  onClick={(e) => {
                    if (!profilePath) e.preventDefault();
                    else closeOnMobile();
                  }}
                  className="flex w-full items-center gap-3 text-left aria-disabled:pointer-events-none"
                >
                  {currentUser && (
                    <UserAvatar
                      userId={currentUser.id}
                      role={currentUser.role}
                      firstName={currentUser.firstName}
                      lastName={currentUser.lastName}
                      className="h-9 w-9 rounded-lg"
                    />
                  )}
                  <div className="grid flex-1 truncate text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {currentUser?.email}
                    </span>
                  </div>
                </Link>
              }
            />

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Log out"
              title="Log out"
              className="shrink-0 rounded-full bg-background text-foreground hover:bg-background/80 hover:text-foreground group-data-[collapsible=icon]:mx-auto"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
