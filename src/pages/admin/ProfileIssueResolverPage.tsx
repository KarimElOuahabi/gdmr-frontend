import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetStaffProfileByIdQuery } from "@/features/staff/staffApi";
import { buildUserProfilePath } from "@/pages/admin/staffDetailPath";
import { PageLoader } from "@/components/common/page-loader";

// Deep-link target for a "profile correction requested" notification — looks up
// the reported user's actual role (the staff endpoint returns it for any user,
// not just ADMIN/HR) then redirects to the right editable profile page.
export function ProfileIssueResolverPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isError } = useGetStaffProfileByIdQuery(Number(userId));

  useEffect(() => {
    if (data) {
      navigate(buildUserProfilePath(data.role, data.userId), { replace: true });
    } else if (isError) {
      navigate("/notifications", { replace: true });
    }
  }, [data, isError, navigate]);

  return <PageLoader />;
}
