import { useParams } from "react-router-dom";
import { useGetEmployeeProfileByUserIdQuery } from "@/features/employee-management/employeeManagementApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { EmployeeProfileCard } from "@/features/employee-management/EmployeeProfileCard";

// Reached from the Users datatable, which only knows the User table id — unlike
// EmployeeDetailPage (keyed by the Employee entity's own id from the Employees list).
export function EmployeeDetailByUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const {
    data: employeeProfile,
    isLoading,
    isError,
  } = useGetEmployeeProfileByUserIdQuery(Number(userId));

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !employeeProfile) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
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
        department={employeeProfile.department}
        role={employeeProfile.role}
        jobTitle={employeeProfile.jobTitle}
        hasProfilePicture={employeeProfile.hasProfilePicture}
      />

      <EmployeeProfileCard employee={employeeProfile} editable />
    </div>
  );
}
