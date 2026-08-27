import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import {
  notificationApi,
  useGetStreamTicketMutation,
  NOTIFICATIONS_API_BASE_URL,
  type NotificationType,
} from "@/features/notification/notificationApi";
import { visitApi } from "@/features/visit/visitApi";
import { documentApi } from "@/features/document/documentApi";

const RECONNECT_DELAY_MS = 3000;

interface SseNotificationPayload {
  type: NotificationType;
  relatedVisitId: number | null;
}

// Every notification type the backend sends corresponds 1:1 to a visit or
// document change, so route each push straight to the RTK Query tags that
// back the dashboards/calendars — no separate polling needed for those.
function invalidateForNotification(
  dispatch: ReturnType<typeof useAppDispatch>,
  payload: SseNotificationPayload,
) {
  if (payload.type === "DOCUMENT_UPLOADED") {
    dispatch(
      documentApi.util.invalidateTags([{ type: "Document", id: "LIST" }]),
    );
    return;
  }

  const tags: Parameters<typeof visitApi.util.invalidateTags>[0] = [
    { type: "visit", id: "LIST" },
  ];
  if (payload.relatedVisitId != null) {
    tags.push({ type: "visit", id: payload.relatedVisitId });
    tags.push({ type: "negotiationHistory", id: payload.relatedVisitId });
  }
  dispatch(visitApi.util.invalidateTags(tags));
}

/**
 * Renders nothing — just keeps one live SSE connection open for the session so the
 * notification bell updates the instant something happens, instead of waiting on
 * the polling fallback. Mounted once, inside AuthenticatedLayout.
 */
export function NotificationStream() {
  const dispatch = useAppDispatch();
  const [getTicket] = useGetStreamTicketMutation();

  useEffect(() => {
    // Local to this effect run (not a shared ref) so StrictMode's mount/cleanup/
    // remount in dev can't leave a stale continuation racing the new connection.
    let cancelled = false;
    let currentSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      if (cancelled) return;
      try {
        const { ticket } = await getTicket().unwrap();
        if (cancelled) return;

        const source = new EventSource(
          `${NOTIFICATIONS_API_BASE_URL}/notifications/stream?ticket=${ticket}`,
        );
        currentSource = source;

        source.addEventListener("notification", (event: MessageEvent) => {
          dispatch(
            notificationApi.util.invalidateTags([
              "NotificationCount",
              { type: "Notification", id: "LIST" },
            ]),
          );

          try {
            const payload: SseNotificationPayload = JSON.parse(event.data);
            invalidateForNotification(dispatch, payload);
          } catch {
            // Malformed/unparsable payload — the notification badge still
            // updated above, so the user isn't left without any signal.
          }
        });

        source.onerror = () => {
          source.close();
          if (currentSource === source) currentSource = null;
          if (!cancelled) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        };
      } catch {
        if (!cancelled) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      currentSource?.close();
    };
  }, [dispatch, getTicket]);

  return null;
}
