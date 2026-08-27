import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { selectRole } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { CheckCheck, Inbox } from "lucide-react";
import {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/features/notification/notificationApi";
import type { NotificationResponse } from "@/features/notification/notificationApi";
import {
  getNotificationMeta,
  formatRelativeTime,
  getTypesForCategory,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "@/features/notification/notificationMeta";
import { getNotificationTarget } from "@/features/notification/notificationRouting";

const PAGE_SIZE = 15;

export function NotificationsPage() {
  const navigate = useNavigate();
  const role = useAppSelector(selectRole);
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [category, setCategory] = useState<NotificationCategory | "all">(
    "all",
  );

  const { data, isLoading } = useListNotificationsQuery({
    unreadOnly,
    types: getTypesForCategory(category),
    page,
    size: PAGE_SIZE,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (n: NotificationResponse) => {
    if (!n.read) markRead({ id: n.id });
    const target = getNotificationTarget(n, role);
    if (target) navigate(target);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Everything relevant to your visits, in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => {
              setUnreadOnly((v) => !v);
              setPage(0);
            }}
          >
            {unreadOnly ? "Showing unread" : "Show unread only"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={isMarkingAll}
            onClick={() => markAllRead()}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={category === "all" ? "default" : "outline"}
          onClick={() => {
            setCategory("all");
            setPage(0);
          }}
        >
          All
        </Button>
        {NOTIFICATION_CATEGORIES.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            size="sm"
            variant={category === value ? "default" : "outline"}
            className="gap-1.5"
            onClick={() => {
              setCategory(value);
              setPage(0);
            }}
          >
            <Icon className="size-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            unreadOnly ? "No unread notifications" : "No notifications yet"
          }
          description={
            category === "all"
              ? undefined
              : `Nothing in ${NOTIFICATION_CATEGORIES.find((c) => c.value === category)?.label.toLowerCase()} right now.`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const meta = getNotificationMeta(n.type);
            const Icon = meta.icon;
            return (
              <Card
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex-row items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/30 ${
                  n.read ? "" : "ring-1 ring-primary/20"
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${meta.className}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{n.title}</span>
                      {!n.read && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
                {!n.read && (
                  <Button
                    size="xs"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleClick(n)}
                  >
                    Mark read
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {data.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {unreadCount > 0 &&
          `${unreadCount} unread on this page.`}
      </p>
    </div>
  );
}
