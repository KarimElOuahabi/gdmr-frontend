import { useParams } from "react-router-dom";
import { useGetStaffProfileByIdQuery } from "@/features/staff/staffApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeaderCard } from "@/components/common/ProfileHeaderCard";
import { StaffProfileCard } from "@/features/staff/StaffProfileCard";

export function StaffDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const {
    data: profile,
    isLoading,
    isError,
  } = useGetStaffProfileByIdQuery(Number(userId));
  const { data: currentUser } = useGetCurrentUserQuery();
  const canEdit = currentUser?.role === "ADMIN";

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="space-y-4 max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load profile data.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {profile.firstName} {profile.lastName}
      </h1>

      <ProfileHeaderCard
        id={profile.userId}
        firstName={profile.firstName}
        lastName={profile.lastName}
        active={profile.active}
        role={profile.role}
        jobTitle={profile.jobTitle}
        hasProfilePicture={profile.hasProfilePicture}
      />

      <StaffProfileCard profile={profile} editable={canEdit} />
    </div>
  );
}
