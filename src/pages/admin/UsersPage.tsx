import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/common/data-table";
import { buildUserColumns } from "@/features/admin/usersColumns";

// The clean, separated modal architecture
import { CreateUserWizardModal } from "@/features/admin/CreateUserWizardModal";
import { EditUserModal } from "@/features/admin/EditUserModal";
import {
  useListUsersQuery,
  useChangeUserStatusMutation,
  type UserResponse,
} from "@/features/admin/adminUsersApi";
import { buildUserProfilePath } from "@/pages/admin/staffDetailPath";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { toast } from "@/components/ui/toast";

const PAGE_SIZE = 10;

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  // Explicitly separate modal states
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data, isLoading } = useListUsersQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
  });

  const [changeStatus] = useChangeUserStatusMutation();
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUserQuery();

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setEditFormOpen(true); // Triggers the dedicated Edit modal
  };

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
    onEdit: handleEdit,
    onToggleStatus: handleToggleStatus,
    onViewProfile: (user) => {
      navigate(buildUserProfilePath(user.role, user.id));
    },
    currentUserId: currentUser?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="max-w-sm"
          />
          <Button
            onClick={() => {
              setCreateFormOpen(true); // Triggers the Wizard
            }}
          >
            Create user
          </Button>
        </div>
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

      {/* CreateUserWizardModal (Parent for Create flow) */}
      <CreateUserWizardModal
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onCreated={(password) => setTempPassword(password)}
      />

      {/* EditUserModal (Dedicated container strictly for editing) */}
      <EditUserModal
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        editingUser={editingUser}
      />

      {/* Temporary Password Alert */}
      <AlertDialog
        open={!!tempPassword}
        onOpenChange={() => setTempPassword(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User created</AlertDialogTitle>
            <AlertDialogDescription>
              Temporary password (shown only once — share it securely):
              <div className="mt-2 rounded bg-muted p-2 font-mono text-sm">
                {tempPassword}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setTempPassword(null)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
