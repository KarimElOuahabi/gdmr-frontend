import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ProfileIssueIndicator } from "@/components/common/ProfileIssueIndicator";
import {
  UpdateDoctorForm,
  type DoctorFormValues,
} from "@/features/doctor-management/UpdateDoctorForm";
import { useUpsertDoctorMutation } from "@/features/doctor-management/doctorManagementApi";
import type { DoctorProfileResponse } from "@/features/doctor/doctorApi";

interface DoctorProfileCardProps {
  doctor: DoctorProfileResponse;
  /** Admin/HR viewing another doctor can edit; the doctor viewing their own page cannot. */
  editable: boolean;
}

// The single "Contact & employment details" card used everywhere a doctor's
// info is shown — same design whether it's their own read-only profile or an
// Admin/HR editing it, matching MyProfilePage's HR/Admin layout.
export function DoctorProfileCard({ doctor, editable }: DoctorProfileCardProps) {
  const [upsertDoctor, { isLoading }] = useUpsertDoctorMutation();

  const handleSubmit = async (data: DoctorFormValues) => {
    try {
      await upsertDoctor({
        userId: doctor.userId,
        request: {
          phoneNumber: data.phoneNumber,
          specialty: data.specialty,
          qualifications: data.qualifications,
          yearsOfExperience: data.yearsOfExperience,
          workSite: data.workSite,
          cnssNumber: data.cnssNumber || null,
        },
      }).unwrap();
      toast.add({
        title: "Success",
        description: "Doctor profile has been updated.",
      });
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update doctor profile.",
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
        {editable && <ProfileIssueIndicator userId={doctor.userId} />}
      </CardHeader>
      <CardContent>
        <FieldGroup className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={doctor.email} disabled />
          </Field>
          <Field>
            <FieldLabel>CIN</FieldLabel>
            <Input value={doctor.cin ?? ""} disabled />
          </Field>
        </FieldGroup>

        {editable ? (
          <UpdateDoctorForm
            key={doctor.id}
            defaultValues={{
              phoneNumber: doctor.phoneNumber,
              specialty: doctor.specialty,
              qualifications: doctor.qualifications,
              yearsOfExperience: doctor.yearsOfExperience,
              workSite: doctor.workSite,
              cnssNumber: doctor.cnssNumber ?? "",
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
              <FieldLabel>Phone Number</FieldLabel>
              <Input value={doctor.phoneNumber} disabled />
            </Field>
            <Field>
              <FieldLabel>Specialty</FieldLabel>
              <Input value={doctor.specialty} disabled />
            </Field>
            <Field>
              <FieldLabel>Qualifications</FieldLabel>
              <Input value={doctor.qualifications} disabled />
            </Field>
            <Field>
              <FieldLabel>Years of Experience</FieldLabel>
              <Input value={String(doctor.yearsOfExperience)} disabled />
            </Field>
            <Field>
              <FieldLabel>Work Site</FieldLabel>
              <Input value={doctor.workSite} disabled />
            </Field>
            <Field>
              <FieldLabel>CNSS Number</FieldLabel>
              <Input value={doctor.cnssNumber ?? ""} disabled />
            </Field>
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  );
}
