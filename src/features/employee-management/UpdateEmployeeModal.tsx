import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  UpdateEmployeeForm,
  type EmployeeFormValues,
} from "@/features/employee-management/UpdateEmployeeForm";
import { useUpsertEmployeeMutation } from "./employeeManagementApi";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";

interface UpdateEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployee: EmployeeProfileResponse | null;
}

export function UpdateEmployeeModal({
  open,
  onOpenChange,
  editingEmployee,
}: UpdateEmployeeModalProps) {
  const [upsertEmployee, { isLoading }] = useUpsertEmployeeMutation();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (data: EmployeeFormValues) => {
    if (!editingEmployee) return;

    try {
      await upsertEmployee({
        userId: editingEmployee.id,
        request: {
          birthDate: data.birthDate,
          department: data.department,
          phoneNumber: data.phoneNumber || null,
          jobTitle: data.jobTitle || null,
          hireDate: data.hireDate || null,
        },
      }).unwrap();

      toast.add({
        title: "Success",
        description: "Employee profile has been updated.",
      });

      handleClose();
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update employee profile.",
      });
    }
  };

  if (!editingEmployee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <UpdateEmployeeForm
          key={editingEmployee.id} // force le remount + reset propre si on change d'employé
          defaultValues={{
            birthDate: editingEmployee.birthDate,
            department: editingEmployee.department,
            phoneNumber: editingEmployee.phoneNumber ?? "",
            jobTitle: editingEmployee.jobTitle ?? "",
            hireDate: editingEmployee.hireDate ?? "",
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
