import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataItem } from "@/components/common/ProfileData";
import { UserAvatar } from "@/components/common/UserAvatar";
import { toast } from "@/components/ui/toast";
import { Building2, IdCard, ShieldCheck, Camera, X, Loader2 } from "lucide-react";
import type { Department } from "@/types/department";
import type { Role } from "@/types/role";
import type { Specialty } from "@/types/specialty";
import {
  useGetProfilePictureUrlQuery,
  useUploadProfilePictureMutation,
  useDeleteProfilePictureMutation,
} from "@/features/profile-picture/profilePictureApi";

interface ProfileHeaderCardProps {
  id?: number;
  firstName: string;
  lastName: string;
  active: boolean;
  employeeId?: number;
  doctorId?: number;
  department?: Department;
  role: Role;
  specialty?: Specialty;
  jobTitle?: string | null;
  hasProfilePicture?: boolean;
  /** Only the profile owner can add, replace, or remove their own picture. */
  editable?: boolean;
}

export function ProfileHeaderCard({
  id,
  firstName,
  lastName,
  active,
  employeeId,
  doctorId,
  department,
  role,
  specialty,
  jobTitle,
  editable = false,
}: ProfileHeaderCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPicture, { isLoading: isUploading }] =
    useUploadProfilePictureMutation();
  const [deletePicture, { isLoading: isDeleting }] =
    useDeleteProfilePictureMutation();
  // Shares its cache entry with the identical query inside <UserAvatar> below
  // (same userId, same tag) — this is just reading that same live state to
  // decide whether the "remove picture" control should show, so it updates
  // immediately after an upload/delete with no extra request.
  const { data: pictureUrl } = useGetProfilePictureUrlQuery(id ?? 0, {
    skip: !id,
  });
  const hasPicture = !!pictureUrl;

  const busy = isUploading || isDeleting;

  // A notification click can deep-link to any profile page with ?highlight=1
  // — glow this card once then fade, same behavior as VisitCard on list pages.
  const [searchParams, setSearchParams] = useSearchParams();
  const isHighlighted = searchParams.has("highlight");
  const [glow, setGlow] = useState(isHighlighted);

  useEffect(() => {
    if (!isHighlighted) return;
    const timeout = setTimeout(() => {
      setGlow(false);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("highlight");
          return next;
        },
        { replace: true },
      );
    }, 2500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHighlighted]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !id) return;

    try {
      await uploadPicture({ userId: id, file }).unwrap();
      toast.add({
        title: "Picture updated",
        description: "Your profile picture has been saved.",
      });
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Please upload a clear, real photo of yourself — ID-photo style, facing the camera.";
      toast.add({ title: "Couldn't use this picture", description: message });
    }
  };

  const handleRemove = async () => {
    if (!id) return;
    try {
      await deletePicture({ userId: id }).unwrap();
      toast.add({ title: "Picture removed" });
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to remove the picture.",
      });
    }
  };

  return (
    <Card
      className={`transition-all duration-700 ${
        glow
          ? "scale-[1.01] ring-2 ring-primary shadow-lg shadow-primary/30"
          : ""
      }`}
    >
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="group/avatar-upload relative shrink-0 self-center sm:self-auto">
          <UserAvatar
            userId={id}
            role={role}
            firstName={firstName}
            lastName={lastName}
            className="h-20 w-20"
            iconClassName="h-8 w-8"
          />

          {editable && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                title="Change picture"
                className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              {hasPicture && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={busy}
                  title="Remove picture"
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover/avatar-upload:opacity-100 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-semibold">
              {firstName} {lastName}
            </h1>
            {active ? (
              <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                Active account
              </Badge>
            ) : (
              <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                Inactive account
              </Badge>
            )}
            {editable && (
              <p className="mt-1 text-xs text-muted-foreground">
                Click the camera icon to add a real photo of yourself —
                ID-photo style: facing the camera, square or portrait framing.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {id ? (
              <DataItem icon={IdCard} label="User ID" value={String(id)} />
            ) : null}
            {employeeId ? (
              <DataItem
                icon={IdCard}
                label="Employee ID"
                value={String(employeeId)}
              />
            ) : null}
            {doctorId ? (
              <DataItem
                icon={IdCard}
                label="Doctor ID"
                value={String(doctorId)}
              />
            ) : null}
            {department ? (
              <DataItem
                icon={Building2}
                label="Department"
                value={department}
              />
            ) : null}
            <DataItem icon={ShieldCheck} label="Role" value={role} />
            {specialty && (
              <DataItem
                icon={ShieldCheck}
                label="Specialty"
                value={specialty}
              />
            )}
            {jobTitle && (
              <DataItem icon={IdCard} label="Job Title" value={jobTitle} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
