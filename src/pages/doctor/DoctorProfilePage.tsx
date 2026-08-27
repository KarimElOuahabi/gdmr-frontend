import { useGetDoctorProfileQuery } from "@/features/doctor/doctorApi";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { DoctorProfileCard } from "@/features/doctor-management/DoctorProfileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportProfileIssueButton } from "@/components/common/ReportProfileIssueButton";

const DOCTOR_FIELD_OPTIONS = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "specialty", label: "Specialty" },
  { value: "phoneNumber", label: "Phone Number" },
  { value: "qualifications", label: "Qualifications" },
  { value: "yearsOfExperience", label: "Years of Experience" },
  { value: "workSite", label: "Work Site" },
];

export function DoctorProfilePage() {
  const {
    data: doctorProfile,
    isLoading,
    isError,
  } = useGetDoctorProfileQuery();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !doctorProfile) {
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
        <ReportProfileIssueButton fieldOptions={DOCTOR_FIELD_OPTIONS} />
      </div>

      <ProfileHeaderCard
        id={doctorProfile.userId}
        firstName={doctorProfile.firstName}
        lastName={doctorProfile.lastName}
        active={doctorProfile.active}
        doctorId={doctorProfile.id}
        role={doctorProfile.role}
        specialty={doctorProfile.specialty}
        hasProfilePicture={doctorProfile.hasProfilePicture}
        editable
      />

      <DoctorProfileCard doctor={doctorProfile} editable={false} />
    </div>
  );
}
