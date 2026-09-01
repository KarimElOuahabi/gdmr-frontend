import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/common/data-table";
import { buildUserColumns } from "@/features/admin/usersColumns";

// The clean, separated modal architecture
import { CreateUserWizardModal } from "@/features/admin/CreateUserWizardModal";
import { EditUserModal } from "@/features/admin/EditUserModal";
import {
  useListUsersQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
  type UserResponse,
} from "@/features/admin/adminUsersApi";
import { buildUserProfilePath } from "@/pages/admin/staffDetailPath";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { toast } from "@/components/ui/toast";
import { ALL_ROLES, type Role } from "@/types/role";

const PAGE_SIZE = 10;

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [role, setRole] = useState<Role | undefined>(undefined);

  // Explicitly separate modal states
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data, isLoading } = useListUsersQuery({
    page,
    size: PAGE_SIZE,
    search: searchId.trim() || search || undefined,
    role,
  });

  const [changeStatus] = useChangeUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
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

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser({ id: deletingUser.id }).unwrap();
      toast.add({
        title: "User deleted",
        description: `${deletingUser.firstName} ${deletingUser.lastName} has been permanently removed.`,
      });
      setDeletingUser(null);
    } catch {
      toast.add({
        title: "Couldn't delete this user",
        description:
          "They already have associated records (visits, documents, etc.). Deactivate them instead.",
      });
    }
  };

  const columns = buildUserColumns({
    onEdit: handleEdit,
    onToggleStatus: handleToggleStatus,
    onDelete: setDeletingUser,
    onViewProfile: (user) => {
      navigate(buildUserProfilePath(user.role, user.id));
    },
    currentUserId: currentUser?.id,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 min-[420px]:flex-row sm:max-w-md sm:flex-1">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full"
            />
            <Input
              placeholder="Search by ID..."
              inputMode="numeric"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value.replace(/\D/g, ""));
                setPage(0);
              }}
              className="w-full min-[420px]:w-28 sm:w-32"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={role ?? "ALL"}
              onValueChange={(v) => {
                setRole(v === "ALL" ? undefined : (v as Role));
                setPage(0);
              }}
            >
              <SelectTrigger className="flex-1 sm:w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="shrink-0"
              onClick={() => {
                setCreateFormOpen(true); // Triggers the Wizard
              }}
            >
              Create user
            </Button>
          </div>
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

      {/* Delete confirmation — hard delete, no trace left behind */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{" "}
              <span className="font-medium text-foreground">
                {deletingUser?.firstName} {deletingUser?.lastName}
              </span>{" "}
              and all trace of their account. This cannot be undone. If they
              already have visits or documents on file, use Deactivate
              instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
