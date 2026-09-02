import type { NotificationResponse } from "@/features/notification/notificationApi";
import type { Role } from "@/types/role";

/** Where clicking a notification should take you, and which element to glow once there. */
export function getNotificationTarget(
  n: NotificationResponse,
  role: Role | null | undefined,
): string | null {
  if (n.type === "PROFILE_ISSUE_REPORTED") {
    return n.relatedUserId && (role === "ADMIN" || role === "HR")
      ? `/admin/profile-issues/${n.relatedUserId}`
      : null;
  }

  // Not visit-highlightable — a document can exist without a visitId (a
  // self-uploaded certificate), so this is checked before the relatedVisitId
  // guard below rather than falling into the generic visit routing.
  if (n.type === "DOCUMENT_UPLOADED" && role === "EMPLOYEE") {
    return "/employee/documents";
  }

  if (!n.relatedVisitId) return null;
  const id = n.relatedVisitId;

  switch (role) {
    case "EMPLOYEE":
      return n.type === "SLOT_PROPOSED" || n.type === "VISIT_REJECTED"
        ? `/employee/proposed-visits?highlight=${id}`
        : `/employee/appointments?highlight=${id}`;
    case "DOCTOR":
      return n.type === "EMPLOYEE_CONFIRMED"
        ? `/doctor/visit-requests?highlight=${id}`
        : `/doctor/upcoming-visits?highlight=${id}`;
    case "HR":
      // These two land on a VisitCard list (glow works there); everything
      // else goes straight to the single-visit detail page instead of the
      // /visits datatable, which has no per-row highlight to glow — the
      // detail page glows its own card instead.
      return n.type === "VISIT_REQUESTED" || n.type === "VISIT_REJECTED"
        ? `/hr/visit-requests?highlight=${id}`
        : `/visits/${id}?highlight=${id}`;
    case "ADMIN":
      return `/visits/${id}?highlight=${id}`;
    default:
      return null;
  }
}
