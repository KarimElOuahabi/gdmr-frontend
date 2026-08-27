import { useParams } from "react-router-dom";
import { useGetDoctorProfileByIdQuery } from "@/features/doctor-management/doctorManagementApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { DoctorProfileCard } from "@/features/doctor-management/DoctorProfileCard";

export function DoctorDetailPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const {
    data: doctorProfile,
    isLoading,
    isError,
  } = useGetDoctorProfileByIdQuery(Number(doctorId));

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
