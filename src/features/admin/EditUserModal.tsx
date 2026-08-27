import { useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/components/ui/toast";
import { useUpdateUserMutation, type UserResponse } from "./adminUsersApi";
import { type Role, ALL_ROLES } from "@/types/role";
import {
  useGetEmployeeProfileByUserIdQuery,
  useUpsertEmployeeMutation,
} from "@/features/employee-management/employeeManagementApi";
import {
  useGetStaffProfileByIdQuery,
  useUpdateStaffProfileByIdMutation,
} from "@/features/staff/staffApi";

const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(ALL_ROLES),
  cin: z.string(),
  jobTitle: z.string(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: UserResponse | null;
}

export function EditUserModal({
  open,
  onOpenChange,
  editingUser,
}: EditUserModalProps) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [upsertEmployee] = useUpsertEmployeeMutation();
  const [updateStaffProfile] = useUpdateStaffProfileByIdMutation();

  // The original role this user had when the modal opened — job title lives
  // on a different backing entity per role, so we always target that entity
  // even if the admin also changes the role in this same submit.
  const originalRole = editingUser?.role;
  const isEmployee = originalRole === "EMPLOYEE";
  const isStaff = originalRole === "HR" || originalRole === "ADMIN";

  const { data: employeeProfile } = useGetEmployeeProfileByUserIdQuery(
    editingUser?.id ?? 0,
    { skip: !open || !editingUser || !isEmployee },
  );
  const { data: staffProfile } = useGetStaffProfileByIdQuery(
    editingUser?.id ?? 0,
    { skip: !open || !editingUser || !isStaff },
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "EMPLOYEE",
      cin: "",
      jobTitle: "",
    },
  });

  // Job title lives on a separate entity (Employee or StaffProfile) fetched
  // async — re-reset once it lands so it becomes part of the clean baseline
  // instead of showing as a false "dirty" change the admin never made.
  useEffect(() => {
    if (!open || !editingUser) return;
    if (isEmployee && !employeeProfile) return;
    if (isStaff && !staffProfile) return;

    reset({
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      role: editingUser.role,
      cin: editingUser.cin ?? "",
      jobTitle: isEmployee
        ? (employeeProfile?.jobTitle ?? "")
        : isStaff
          ? (staffProfile?.jobTitle ?? "")
          : "",
    });
  }, [open, editingUser, isEmployee, isStaff, employeeProfile, staffProfile, reset]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => reset(), 200);
  };

  const role = watch("role");

  const onSubmit = async (data: EditUserFormValues) => {
    if (!editingUser) return;

    try {
      await updateUser({
        id: editingUser.id,
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          cin: data.cin || null,
        },
      }).unwrap();

      if (isEmployee && employeeProfile) {
        await upsertEmployee({
          userId: editingUser.id,
          request: {
            birthDate: employeeProfile.birthDate,
            department: employeeProfile.department,
            phoneNumber: employeeProfile.phoneNumber,
            jobTitle: data.jobTitle || null,
            hireDate: employeeProfile.hireDate,
            cnssNumber: employeeProfile.cnssNumber,
          },
        }).unwrap();
      } else if (isStaff && staffProfile) {
        await updateStaffProfile({
          userId: editingUser.id,
          body: {
            phoneNumber: staffProfile.phoneNumber,
            jobTitle: data.jobTitle || null,
            hireDate: staffProfile.hireDate,
            officeLocation: staffProfile.officeLocation,
          },
        }).unwrap();
      }

      toast.add({
        title: "Success",
        description: "User profile has been updated.",
      });

      handleClose();
    } catch (err) {
      toast.add({
        title: "Error",
        description: "Failed to update user profile.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <FieldError>{errors.firstName.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <FieldError>{errors.lastName.message}</FieldError>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="cin">
                CIN{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input id="cin" {...register("cin")} />
            </Field>

            {(isEmployee || isStaff) && (
              <Field>
                <FieldLabel htmlFor="jobTitle">
                  Job Title{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Input id="jobTitle" {...register("jobTitle")} />
              </Field>
            )}

            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(v) =>
                  setValue("role", v as Role, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <FieldError>{errors.role.message}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
