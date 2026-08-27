import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { RolesStatsResponse } from "./adminRolesApi";

export const rolesColumns: ColumnDef<RolesStatsResponse>[] = [
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {row.original.role}
      </span>
    ),
  },
  {
    accessorKey: "totalUsers",
    header: "Total Users",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {row.original.totalUsers}
      </span>
    ),
  },
  {
    accessorKey: "activeUsers",
    header: "Active Users",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      >
        {row.original.activeUsers} Active
      </Badge>
    ),
  },
  {
    accessorKey: "inactiveUsers",
    header: "Inactive Users",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      >
        {row.original.inactiveUsers} Inactive
      </Badge>
    ),
  },
];
