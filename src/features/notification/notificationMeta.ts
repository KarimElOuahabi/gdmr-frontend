import {
  Inbox,
  CalendarClock,
  UserCheck,
  CalendarX,
  CalendarCheck,
  BellRing,
  UserX,
  FileUp,
  Flag,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/features/notification/notificationApi";

interface NotificationMeta {
  icon: LucideIcon;
  className: string;
}

const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  VISIT_REQUESTED: {
    icon: Inbox,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  SLOT_PROPOSED: {
    icon: CalendarClock,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  EMPLOYEE_CONFIRMED: {
    icon: UserCheck,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  VISIT_REJECTED: {
    icon: CalendarX,
    className: "bg-destructive/10 text-destructive",
  },
  VISIT_SCHEDULED: {
    icon: CalendarCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  VISIT_REMINDER: {
    icon: BellRing,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  VISIT_ABSENT: {
    icon: UserX,
    className: "bg-destructive/10 text-destructive",
  },
  DOCUMENT_UPLOADED: {
    icon: FileUp,
    className: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  },
  PROFILE_ISSUE_REPORTED: {
    icon: Flag,
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
};

export function getNotificationMeta(type: NotificationType): NotificationMeta {
  return NOTIFICATION_META[type];
}

export type NotificationCategory = "visits" | "documents" | "profile";

const CATEGORY_TYPES: Record<NotificationCategory, NotificationType[]> = {
  visits: [
    "VISIT_REQUESTED",
    "SLOT_PROPOSED",
    "EMPLOYEE_CONFIRMED",
    "VISIT_REJECTED",
    "VISIT_SCHEDULED",
    "VISIT_REMINDER",
    "VISIT_ABSENT",
  ],
  documents: ["DOCUMENT_UPLOADED"],
  profile: ["PROFILE_ISSUE_REPORTED"],
};

export const NOTIFICATION_CATEGORIES: {
  value: NotificationCategory;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "visits", label: "Visits", icon: CalendarCheck },
  { value: "documents", label: "Documents", icon: FileUp },
  { value: "profile", label: "Profile", icon: Flag },
];

export function getTypesForCategory(
  category: NotificationCategory | "all",
): NotificationType[] | undefined {
  return category === "all" ? undefined : CATEGORY_TYPES[category];
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
