import type { LucideIcon } from "lucide-react";
import type { Role } from "./role";

export type RouteItem = {
  key: string;
  label?: string;
  path: string;
  icon?: LucideIcon;
  roles?: Role[];
  isProfilePopoverItem?: boolean;
  children?: RouteItem[];
  // Sidebar section this route is grouped under (see routes.tsx SIDEBAR_GROUPS).
  group?: string;
};
