import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/data-table";
import { buildUserColumns } from "@/features/admin/usersColumns";
import { EditUserModal } from "@/features/admin/EditUserModal";
import { UpdateStaffModal } from "@/features/staff/UpdateStaffModal";
import {
  useListUsersQuery,
  useChangeUserStatusMutation,
  type UserResponse,
} from "@/features/admin/adminUsersApi";
import type { Role } from "@/types/role";
import { buildUserProfilePath } from "@/pages/admin/staffDetailPath";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { toast } from "@/components/ui/toast";

const PAGE_SIZE = 10;

interface RoleUsersPageProps {
  role: Role;
  title: string;
}

export function RoleUsersPage({ role, title }: RoleUsersPageProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [staffEditOpen, setStaffEditOpen] = useState(false);
  const [editingStaffUserId, setEditingStaffUserId] = useState<number | null>(
    null,
  );

  const { data, isLoading } = useListUsersQuery({
    role,
    page,
    size: PAGE_SIZE,
    search: search || undefined,
  });

  const [changeStatus] = useChangeUserStatusMutation();
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUserQuery();

  const handleToggleStatus = async (user: UserResponse) => {
    try {
      await changeStatus({ id: user.id, active: !user.active }).unwrap();
      toast.add({
        title: user.active ? "User deactivated" : "User activated",
        description: `${user.firstName} ${user.lastName}'s account is now ${
          user.active ? "inactive" : "active"
        }.`,
      });
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update the user's status.",
      });
    }
  };

  const columns = buildUserColumns({
    onEdit: (user) => {
      setEditingUser(user);
      setEditFormOpen(true);
    },
    onToggleStatus: handleToggleStatus,
    onDelete: () => {},
    onViewProfile: (user) => {
      navigate(buildUserProfilePath(user.role, user.id));
    },
    onEditProfile: (user) => {
      setEditingStaffUserId(user.id);
      setStaffEditOpen(true);
    },
    showRole: false,
    showAvatar: true,
    showActions: false,
    // HR can view other HR/Admin users here but must not edit them — only an
    // Admin viewing this same table gets the edit-profile pencil.
    showEditProfile: currentUser?.role !== "HR",
    currentUserId: currentUser?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Input
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        pageCount={data?.totalPages ?? 0}
        pageIndex={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <EditUserModal
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        editingUser={editingUser}
      />

      <UpdateStaffModal
        open={staffEditOpen}
        onOpenChange={setStaffEditOpen}
        editingUserId={editingStaffUserId}
      />
    </div>
  );
}
