import { useParams } from "react-router-dom";
import { useGetEmployeeProfileByIdQuery } from "@/features/employee-management/employeeManagementApi";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { EmployeeProfileCard } from "@/features/employee-management/EmployeeProfileCard";
import { Skeleton } from "@/components/ui/skeleton";

export function PatientDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const {
    data: employeeProfile,
    isLoading,
    isError,
  } = useGetEmployeeProfileByIdQuery(Number(employeeId));

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Patient Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !employeeProfile) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Patient Profile</h1>
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load profile data.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {employeeProfile.firstName} {employeeProfile.lastName}
      </h1>

      <ProfileHeaderCard
        id={employeeProfile.id}
        firstName={employeeProfile.firstName}
        lastName={employeeProfile.lastName}
        active={employeeProfile.active}
        employeeId={employeeProfile.employeeId}
        role={employeeProfile.role}
        department={employeeProfile.department}
        jobTitle={employeeProfile.jobTitle}
        hasProfilePicture={employeeProfile.hasProfilePicture}
      />

      <EmployeeProfileCard employee={employeeProfile} editable={false} />
    </div>
  );
}
