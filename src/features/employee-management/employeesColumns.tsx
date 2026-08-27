import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Eye, Pen } from "lucide-react";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";
import type { Department } from "@/types/department";

function formatDepartment(dept?: Department | string): string {
  if (!dept) return "N/A";
  return dept
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface EmployeeColumnActions {
  onViewProfile: (employee: EmployeeProfileResponse) => void;
  onEditEmployee: (employee: EmployeeProfileResponse) => void;
}

export function buildEmployeeColumns({
  onViewProfile,
  onEditEmployee,
}: EmployeeColumnActions): ColumnDef<EmployeeProfileResponse>[] {
  return [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <UserAvatar
          userId={row.original.id}
          role={row.original.role}
          firstName={row.original.firstName}
          lastName={row.original.lastName}
          className="h-9 w-9"
        />
      ),
    },
    {
      id: "fullName",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {formatDepartment(row.original.department)}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400"
          >
            Inactive
          </Badge>
        ),
    },
    {
      id: "editProfile",
      header: () => <div className="text-center">Edit Profile</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => onEditEmployee(row.original)}
            title="Edit Employee"
          >
            <Pen className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      id: "viewProfile",
      header: () => <div className="text-center">View Profile</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => onViewProfile(row.original)}
            title="View Profile"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
