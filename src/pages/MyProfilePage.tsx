import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetMyStaffProfileQuery,
  useUpdateMyStaffProfileMutation,
} from "@/features/staff/staffApi";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { ReportProfileIssueButton } from "@/components/common/ReportProfileIssueButton";
import { ProfileIssueIndicator } from "@/components/common/ProfileIssueIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { Briefcase } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { selectRole } from "@/features/auth/authSlice";

const HR_FIELD_OPTIONS = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phoneNumber", label: "Phone Number" },
  { value: "jobTitle", label: "Job Title" },
  { value: "officeLocation", label: "Office Location" },
  { value: "hireDate", label: "Hire Date" },
];

const staffProfileFormSchema = z.object({
  jobTitle: z.string(),
  phoneNumber: z.string(),
  hireDate: z.string(),
  officeLocation: z.string(),
});
type StaffProfileFormValues = z.infer<typeof staffProfileFormSchema>;

// HR/Admin have no dedicated profile entity like employees/doctors do — they
// manage their own contact/employment details directly on this page.
export function MyProfilePage() {
  const role = useAppSelector(selectRole);
  const isAdmin = role === "ADMIN";
  const { data: user, isLoading, isError } = useGetMyStaffProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateMyStaffProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<StaffProfileFormValues>({
    resolver: zodResolver(staffProfileFormSchema),
    values: {
      jobTitle: user?.jobTitle ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      hireDate: user?.hireDate ?? "",
      officeLocation: user?.officeLocation ?? "",
    },
  });

  const onSubmit = async (data: StaffProfileFormValues) => {
    try {
      await updateProfile({
        jobTitle: data.jobTitle || null,
        phoneNumber: data.phoneNumber || null,
        hireDate: data.hireDate || null,
        officeLocation: data.officeLocation || null,
      }).unwrap();
      toast.add({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch {
      toast.add({ title: "Error", description: "Failed to save your profile." });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load profile data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        {!isAdmin && (
          <ReportProfileIssueButton fieldOptions={HR_FIELD_OPTIONS} />
        )}
      </div>

      <ProfileHeaderCard
        id={user.userId}
        firstName={user.firstName}
        lastName={user.lastName}
        active={user.active}
        role={user.role}
        jobTitle={user.jobTitle}
        hasProfilePicture={user.hasProfilePicture}
        editable
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            Contact & employment details
          </CardTitle>
          {isAdmin && <ProfileIssueIndicator userId={user.userId} />}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={user.email} disabled />
              </Field>
              <Field>
                <FieldLabel>CIN</FieldLabel>
                <Input value={user.cin ?? ""} disabled />
              </Field>
              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                <Input
                  id="phoneNumber"
                  disabled={!isAdmin}
                  {...register("phoneNumber")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
                <Input
                  id="jobTitle"
                  placeholder="e.g. HR Manager"
                  disabled={!isAdmin}
                  {...register("jobTitle")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="officeLocation">
                  Office Location
                </FieldLabel>
                <Input
                  id="officeLocation"
                  placeholder="e.g. HQ - 3rd floor"
                  disabled={!isAdmin}
                  {...register("officeLocation")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="hireDate">Hire Date</FieldLabel>
                <Input
                  id="hireDate"
                  type="date"
                  disabled={!isAdmin}
                  {...register("hireDate")}
                />
              </Field>
            </FieldGroup>

            {isAdmin && (
              <div className="flex justify-end">
                <Button type="submit" disabled={!isDirty || isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
