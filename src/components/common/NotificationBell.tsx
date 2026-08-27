import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { selectRole } from "@/features/auth/authSlice";
import { getNotificationTarget } from "@/features/notification/notificationRouting";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import {
  useListNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  POLL_INTERVAL_MS,
} from "@/features/notification/notificationApi";
import type { NotificationResponse } from "@/features/notification/notificationApi";
import {
  getNotificationMeta,
  formatRelativeTime,
} from "@/features/notification/notificationMeta";

export function NotificationBell() {
  const navigate = useNavigate();
  const role = useAppSelector(selectRole);
  const { data: countData } = useUnreadNotificationCountQuery(undefined, {
    pollingInterval: POLL_INTERVAL_MS,
  });
  const { data, isLoading } = useListNotificationsQuery(
    { page: 0, size: 8 },
    { pollingInterval: POLL_INTERVAL_MS },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const unreadCount = countData?.count ?? 0;
  const notifications = data?.content ?? [];

  const handleItemClick = (n: NotificationResponse) => {
    if (!n.read) markRead({ id: n.id });
    const target = getNotificationTarget(n, role);
    if (target) navigate(target);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/60" />
                <Badge className="relative size-4 justify-center rounded-full bg-destructive p-0 text-[10px] text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold text-foreground">
            Notifications
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="gap-1 text-xs"
              disabled={isMarkingAll}
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="mx-0" />

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </p>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <Inbox className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => {
                const meta = getNotificationMeta(n.type);
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 ${
                        n.read ? "" : "bg-primary/5"
                      }`}
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {n.message}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DropdownMenuSeparator className="mx-0" />
        <Link
          to="/notifications"
          className="block px-3 py-2.5 text-center text-sm font-medium text-primary hover:underline"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
