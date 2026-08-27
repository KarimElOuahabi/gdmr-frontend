import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ProfileIssueIndicator } from "@/components/common/ProfileIssueIndicator";
import {
  UpdateEmployeeForm,
  type EmployeeFormValues,
} from "@/features/employee-management/UpdateEmployeeForm";
import { useUpsertEmployeeMutation } from "@/features/employee-management/employeeManagementApi";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";

interface EmployeeProfileCardProps {
  employee: EmployeeProfileResponse;
  /** Admin/HR viewing another employee can edit; the employee viewing their own page cannot. */
  editable: boolean;
}

// The single "Contact & employment details" card used everywhere an employee's
// info is shown — same design whether it's their own read-only profile or an
// Admin/HR editing it, matching MyProfilePage's HR/Admin layout.
export function EmployeeProfileCard({
  employee,
  editable,
}: EmployeeProfileCardProps) {
  const [upsertEmployee, { isLoading }] = useUpsertEmployeeMutation();

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      await upsertEmployee({
        userId: employee.id,
        request: {
          birthDate: data.birthDate,
          department: data.department,
          phoneNumber: data.phoneNumber || null,
          jobTitle: data.jobTitle || null,
          hireDate: data.hireDate || null,
          cnssNumber: data.cnssNumber || null,
        },
      }).unwrap();
      toast.add({
        title: "Success",
        description: "Employee profile has been updated.",
      });
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update employee profile.",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4" />
          Contact & employment details
        </CardTitle>
        {editable && <ProfileIssueIndicator userId={employee.id} />}
      </CardHeader>
      <CardContent>
        <FieldGroup className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={employee.email} disabled />
          </Field>
          <Field>
            <FieldLabel>CIN</FieldLabel>
            <Input value={employee.cin ?? ""} disabled />
          </Field>
        </FieldGroup>

        {editable ? (
          <UpdateEmployeeForm
            key={employee.id}
            defaultValues={{
              birthDate: employee.birthDate,
              department: employee.department,
              phoneNumber: employee.phoneNumber ?? "",
              jobTitle: employee.jobTitle ?? "",
              hireDate: employee.hireDate ?? "",
              cnssNumber: employee.cnssNumber ?? "",
            }}
            onSubmit={handleSubmit}
            onCancel={() => {}}
            isSubmitting={isLoading}
            showHeader={false}
            showCancel={false}
          />
        ) : (
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Birth Date</FieldLabel>
              <Input value={employee.birthDate} disabled />
            </Field>
            <Field>
              <FieldLabel>Department</FieldLabel>
              <Input value={employee.department} disabled />
            </Field>
            <Field>
              <FieldLabel>Job Title</FieldLabel>
              <Input value={employee.jobTitle ?? ""} disabled />
            </Field>
            <Field>
              <FieldLabel>Phone Number</FieldLabel>
              <Input value={employee.phoneNumber ?? ""} disabled />
            </Field>
            <Field>
              <FieldLabel>Hire Date</FieldLabel>
              <Input value={employee.hireDate ?? ""} disabled />
            </Field>
            <Field>
              <FieldLabel>CNSS Number</FieldLabel>
              <Input value={employee.cnssNumber ?? ""} disabled />
            </Field>
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  );
}
