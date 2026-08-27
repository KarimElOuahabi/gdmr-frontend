import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { ProfileIssueIndicator } from "@/components/common/ProfileIssueIndicator";
import {
  useUpdateStaffProfileByIdMutation,
  type StaffProfileResponse,
} from "@/features/staff/staffApi";

const staffProfileFormSchema = z.object({
  jobTitle: z.string(),
  phoneNumber: z.string(),
  hireDate: z.string(),
  officeLocation: z.string(),
});
type StaffProfileFormValues = z.infer<typeof staffProfileFormSchema>;

interface StaffProfileCardProps {
  profile: StaffProfileResponse;
  /** Admin editing another HR/Admin user; that user viewing their own page uses MyProfilePage instead. */
  editable: boolean;
}

// The "Contact & employment details" card for an HR/Admin user's profile as
// viewed by Admin — same design as the Employee/Doctor equivalents.
export function StaffProfileCard({ profile, editable }: StaffProfileCardProps) {
  const [updateStaffProfile, { isLoading }] = useUpdateStaffProfileByIdMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<StaffProfileFormValues>({
    resolver: zodResolver(staffProfileFormSchema),
    defaultValues: {
      jobTitle: profile.jobTitle ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      hireDate: profile.hireDate ?? "",
      officeLocation: profile.officeLocation ?? "",
    },
  });

  useEffect(() => {
    reset({
      jobTitle: profile.jobTitle ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      hireDate: profile.hireDate ?? "",
      officeLocation: profile.officeLocation ?? "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: StaffProfileFormValues) => {
    try {
      await updateStaffProfile({
        userId: profile.userId,
        body: {
          jobTitle: data.jobTitle || null,
          phoneNumber: data.phoneNumber || null,
          hireDate: data.hireDate || null,
          officeLocation: data.officeLocation || null,
        },
      }).unwrap();
      toast.add({
        title: "Success",
        description: "Profile has been updated.",
      });
    } catch {
      toast.add({ title: "Error", description: "Failed to update profile." });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4" />
          Contact & employment details
        </CardTitle>
        {editable && <ProfileIssueIndicator userId={profile.userId} />}
      </CardHeader>
      <CardContent>
        <FieldGroup className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={profile.email} disabled />
          </Field>
          <Field>
            <FieldLabel>CIN</FieldLabel>
            <Input value={profile.cin ?? ""} disabled />
          </Field>
        </FieldGroup>

        {editable ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
                <Input
                  id="jobTitle"
                  placeholder="e.g. HR Manager"
                  {...register("jobTitle")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                <Input id="phoneNumber" {...register("phoneNumber")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="officeLocation">
                  Office Location
                </FieldLabel>
                <Input
                  id="officeLocation"
                  placeholder="e.g. HQ - 3rd floor"
                  {...register("officeLocation")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="hireDate">Hire Date</FieldLabel>
                <Input id="hireDate" type="date" {...register("hireDate")} />
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        ) : (
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Job Title</FieldLabel>
              <Input value={profile.jobTitle ?? ""} disabled />
            </Field>
            <Field>
              <FieldLabel>Phone Number</FieldLabel>
              <Input value={profile.phoneNumber ?? ""} disabled />
            </Field>
            <Field>
              <FieldLabel>Office Location</FieldLabel>
              <Input value={profile.officeLocation ?? ""} disabled />
            </Field>
            <Field>
              <FieldLabel>Hire Date</FieldLabel>
              <Input value={profile.hireDate ?? ""} disabled />
            </Field>
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  );
}
