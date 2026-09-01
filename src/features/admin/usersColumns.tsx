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
import { Eye, MoreHorizontal, Pen } from "lucide-react";
import type { UserResponse } from "./adminUsersApi";

interface ColumnActions {
  onEdit: (user: UserResponse) => void;
  onToggleStatus: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onViewProfile: (user: UserResponse) => void;
  // Opens the contact/employment-details edit modal — used on the role-scoped
  // Admins/HR tables to match the Doctors/Employees tables' pencil icon.
  onEditProfile?: (user: UserResponse) => void;
  showRole?: boolean;
  // Only the role-scoped tables (Admins, HR) show a picture column — the
  // general Users table stays text-only.
  showAvatar?: boolean;
  // The "..." actions menu (Edit/Deactivate/Delete) is reserved for the main
  // Users datatable — role-scoped tables (Admins, HR) stay read/view-only here.
  showActions?: boolean;
  // The pencil "Edit Profile" icon — reserved for the role-scoped tables (Admins, HR),
  // giving them the same edit affordance Doctors/Employees already have.
  showEditProfile?: boolean;
  currentUserId?: number;
}

export function buildUserColumns({
  onEdit,
  onToggleStatus,
  onDelete,
  onViewProfile,
  onEditProfile,
  showRole = true,
  showAvatar = false,
  showActions = true,
  showEditProfile = false,
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
      header: "Account Status",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge
            variant="outline"
            className="border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            Inactive
          </Badge>
        ),
    },
    ...(showEditProfile
      ? [
          {
            id: "editProfile",
            header: () => <div className="text-center">Edit Profile</div>,
            cell: ({ row }: { row: { original: UserResponse } }) => (
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  onClick={() => onEditProfile?.(row.original)}
                  title="Edit Profile"
                >
                  <Pen className="h-4 w-4" />
                </Button>
              </div>
            ),
          } as ColumnDef<UserResponse>,
        ]
      : []),
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
    ...(showActions
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: { original: UserResponse } }) => (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    Edit
                  </DropdownMenuItem>
                  {!(row.original.active && row.original.id === currentUserId) && (
                    <DropdownMenuItem
                      onClick={() => onToggleStatus(row.original)}
                    >
                      {row.original.active ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                  )}
                  {row.original.id !== currentUserId && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(row.original)}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          } as ColumnDef<UserResponse>,
        ]
      : []),
  ];
}
