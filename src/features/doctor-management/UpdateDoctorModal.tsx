import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  UpdateDoctorForm,
  type DoctorFormValues,
} from "@/features/doctor-management/UpdateDoctorForm";
import { useUpsertDoctorMutation } from "./doctorManagementApi";
import type { DoctorProfileResponse } from "@/features/doctor/doctorApi";

interface UpdateDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDoctor: DoctorProfileResponse | null;
}

export function UpdateDoctorModal({
  open,
  onOpenChange,
  editingDoctor,
}: UpdateDoctorModalProps) {
  const [upsertDoctor, { isLoading }] = useUpsertDoctorMutation();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (data: DoctorFormValues) => {
    if (!editingDoctor) return;

    try {
      await upsertDoctor({
        userId: editingDoctor.userId,
        request: {
          phoneNumber: data.phoneNumber,
          specialty: data.specialty,
          qualifications: data.qualifications,
          yearsOfExperience: data.yearsOfExperience,
          workSite: data.workSite,
          cnssNumber: data.cnssNumber,
        },
      }).unwrap();

      toast.add({
        title: "Success",
        description: "Doctor profile has been updated.",
      });

      handleClose();
    } catch (err) {
      toast.add({
        title: "Error",
        description: "Failed to update doctor profile.",
      });
    }
  };

  if (!editingDoctor) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <UpdateDoctorForm
          key={editingDoctor.id} // forces remount & reset when changing selected doctor
          defaultValues={{
            phoneNumber: editingDoctor.phoneNumber,
            specialty: editingDoctor.specialty,
            qualifications: editingDoctor.qualifications,
            yearsOfExperience: editingDoctor.yearsOfExperience,
            workSite: editingDoctor.workSite,
            cnssNumber: editingDoctor.cnssNumber ?? "",
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
