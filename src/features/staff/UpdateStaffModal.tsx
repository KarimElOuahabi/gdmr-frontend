import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  UpdateStaffForm,
  type StaffFormValues,
} from "@/features/staff/UpdateStaffForm";
import {
  useGetStaffProfileByIdQuery,
  useUpdateStaffProfileByIdMutation,
} from "@/features/staff/staffApi";

interface UpdateStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUserId: number | null;
}

// Admin-only "Edit" shortcut on the Admins/HR datatables — gives parity with the
// Doctors/Employees tables' pencil icon instead of requiring a trip to the full
// profile page just to change a phone number or job title.
export function UpdateStaffModal({
  open,
  onOpenChange,
  editingUserId,
}: UpdateStaffModalProps) {
  const { data: profile, isLoading } = useGetStaffProfileByIdQuery(
    editingUserId ?? 0,
    { skip: !open || !editingUserId },
  );
  const [updateStaffProfile, { isLoading: isSaving }] =
    useUpdateStaffProfileByIdMutation();

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (data: StaffFormValues) => {
    if (!editingUserId) return;

    try {
      await updateStaffProfile({
        userId: editingUserId,
        body: {
          jobTitle: data.jobTitle || null,
          phoneNumber: data.phoneNumber || null,
          officeLocation: data.officeLocation || null,
          hireDate: data.hireDate || null,
        },
      }).unwrap();

      toast.add({
        title: "Success",
        description: "Profile has been updated.",
      });

      handleClose();
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update profile.",
      });
    }
  };

  if (!editingUserId) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {isLoading || !profile ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <UpdateStaffForm
            key={profile.userId}
            defaultValues={{
              jobTitle: profile.jobTitle ?? "",
              phoneNumber: profile.phoneNumber ?? "",
              officeLocation: profile.officeLocation ?? "",
              hireDate: profile.hireDate ?? "",
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isSubmitting={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
