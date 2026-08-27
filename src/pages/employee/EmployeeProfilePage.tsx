import { useGetEmployeeProfileQuery } from "@/features/employee/employeeApi";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { EmployeeProfileCard } from "@/features/employee-management/EmployeeProfileCard";
import { ReportProfileIssueButton } from "@/components/common/ReportProfileIssueButton";
import { Skeleton } from "@/components/ui/skeleton";

const EMPLOYEE_FIELD_OPTIONS = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "birthDate", label: "Birth Date" },
  { value: "department", label: "Department" },
  { value: "jobTitle", label: "Job Title" },
  { value: "hireDate", label: "Hire Date" },
  { value: "phoneNumber", label: "Phone Number" },
];

export function EmployeeProfilePage() {
  const {
    data: employeeProfile,
    isLoading,
    isError,
  } = useGetEmployeeProfileQuery();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !employeeProfile) {
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
        <ReportProfileIssueButton fieldOptions={EMPLOYEE_FIELD_OPTIONS} />
      </div>

      <ProfileHeaderCard
        id={employeeProfile.id}
        firstName={employeeProfile.firstName}
        lastName={employeeProfile.lastName}
        active={employeeProfile.active}
        employeeId={employeeProfile.employeeId}
        department={employeeProfile.department}
        role={employeeProfile.role}
        jobTitle={employeeProfile.jobTitle}
        hasProfilePicture={employeeProfile.hasProfilePicture}
        editable
      />

      <EmployeeProfileCard employee={employeeProfile} editable={false} />
    </div>
  );
}
