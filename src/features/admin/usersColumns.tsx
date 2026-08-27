import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal } from "lucide-react";
import type { UserResponse } from "./adminUsersApi";

interface ColumnActions {
  onEdit: (user: UserResponse) => void;
  onToggleStatus: (user: UserResponse) => void;
  onViewProfile: (user: UserResponse) => void;
  showRole?: boolean;
  // Only the role-scoped tables (Admins, HR) show a picture column — the
  // general Users table stays text-only.
  showAvatar?: boolean;
  currentUserId?: number;
}

export function buildUserColumns({
  onEdit,
  onToggleStatus,
  onViewProfile,
  showRole = true,
  showAvatar = false,
  currentUserId,
}: ColumnActions): ColumnDef<UserResponse>[] {
  return [
    ...(showAvatar
      ? [
          {
            id: "avatar",
            header: "",
            cell: ({ row }: { row: { original: UserResponse } }) => (
              <UserAvatar
                userId={row.original.id}
                role={row.original.role}
                firstName={row.original.firstName}
                lastName={row.original.lastName}
                className="h-9 w-9"
              />
            ),
          } as ColumnDef<UserResponse>,
        ]
      : []),
    { accessorKey: "id", header: "ID" },
    { accessorKey: "firstName", header: "First name" },
    { accessorKey: "lastName", header: "Last name" },
    { accessorKey: "email", header: "Email" },
    ...(showRole
      ? [
          {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }: { row: { original: UserResponse } }) => (
              <Badge
                variant="outline"
                className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
              >
                {row.original.role}
              </Badge>
            ),
          } as ColumnDef<UserResponse>,
        ]
      : []),
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            Inactive
          </Badge>
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
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            {!(row.original.active && row.original.id === currentUserId) && (
              <DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
                {row.original.active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
