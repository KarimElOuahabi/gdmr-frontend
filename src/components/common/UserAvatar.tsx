import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Briefcase,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";
import type { Role } from "@/types/role";
import { useGetProfilePictureUrlQuery } from "@/features/profile-picture/profilePictureApi";

// A distinct, official-badge-style default per role — stands in until the
// user uploads a real picture of themselves.
export const ROLE_AVATAR_STYLES: Record<
  Role,
  { icon: typeof ShieldCheck; className: string }
> = {
  ADMIN: {
    icon: ShieldCheck,
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  HR: {
    icon: Briefcase,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  DOCTOR: {
    icon: Stethoscope,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  EMPLOYEE: {
    icon: UserIcon,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
};

interface UserAvatarProps {
  userId?: number;
  role: Role;
  firstName: string;
  lastName: string;
  className?: string;
  iconClassName?: string;
}

// Deliberately does NOT gate the fetch behind a cached "hasProfilePicture"
// flag from some other query — that flag can go stale after an upload/delete
// until whatever fetched it refetches, which was showing up as "doesn't show
// until I refresh" and "doesn't show up for other viewers". Always asking the
// picture endpoint (skipping only when we have no id) means this component's
// own tag-based cache (invalidated by the upload/delete mutations) is the
// single source of truth — a 404 for a user with no picture just falls back
// to the role icon below, so this stays cheap and harmless.
export function UserAvatar({
  userId,
  role,
  firstName,
  lastName,
  className,
  iconClassName = "h-4 w-4",
}: UserAvatarProps) {
  const { data: pictureUrl } = useGetProfilePictureUrlQuery(userId ?? 0, {
    skip: !userId,
  });

  const style = ROLE_AVATAR_STYLES[role];
  const RoleIcon = style.icon;

  return (
    <Avatar className={className}>
      {pictureUrl && (
        <AvatarImage src={pictureUrl} alt={`${firstName} ${lastName}`} />
      )}
      <AvatarFallback className={style.className}>
        <RoleIcon className={iconClassName} />
      </AvatarFallback>
    </Avatar>
  );
}
