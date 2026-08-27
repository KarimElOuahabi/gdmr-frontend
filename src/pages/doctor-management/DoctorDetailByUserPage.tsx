import { useParams } from "react-router-dom";
import { useGetDoctorProfileByUserIdQuery } from "@/features/doctor-management/doctorManagementApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { DoctorProfileCard } from "@/features/doctor-management/DoctorProfileCard";

// Reached from the Users datatable, which only knows the User table id — unlike
// DoctorDetailPage (keyed by the Doctor entity's own id from the Doctors list).
export function DoctorDetailByUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const {
    data: doctorProfile,
    isLoading,
    isError,
  } = useGetDoctorProfileByUserIdQuery(Number(userId));

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Doctor Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !doctorProfile) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Doctor Profile</h1>
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load profile data.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {doctorProfile.firstName} {doctorProfile.lastName}
      </h1>

      <ProfileHeaderCard
        id={doctorProfile.userId}
        firstName={doctorProfile.firstName}
        lastName={doctorProfile.lastName}
        active={doctorProfile.active}
        doctorId={doctorProfile.id}
        role={doctorProfile.role}
        specialty={doctorProfile.specialty}
        hasProfilePicture={doctorProfile.hasProfilePicture}
      />

      <DoctorProfileCard doctor={doctorProfile} editable />
    </div>
  );
}
