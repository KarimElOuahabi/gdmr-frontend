import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";
import type { PagedResponse } from "@/types/pagination";
import { API_BASE_URL } from "@/lib/apiConfig";

export type NotificationType =
  | "VISIT_REQUESTED"
  | "SLOT_PROPOSED"
  | "EMPLOYEE_CONFIRMED"
  | "VISIT_REJECTED"
  | "VISIT_SCHEDULED"
  | "VISIT_REMINDER"
  | "VISIT_ABSENT"
  | "DOCUMENT_UPLOADED"
  | "PROFILE_ISSUE_REPORTED";

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedVisitId: number | null;
  relatedUserId: number | null;
  read: boolean;
  createdAt: string;
}

export interface ListNotificationsParams {
  unreadOnly?: boolean;
  types?: NotificationType[];
  page: number;
  size: number;
}

// SSE delivers updates instantly — this is just a safety net in case the stream drops.
const POLL_INTERVAL_MS = 120_000;

export const NOTIFICATIONS_API_BASE_URL = API_BASE_URL;

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notification", "NotificationCount"],
  // Catches anything missed while the tab was backgrounded/throttled and the SSE
  // stream may have stalled — refetch the moment the tab regains focus/network.
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    listNotifications: builder.query<
      PagedResponse<NotificationResponse>,
      ListNotificationsParams
    >({
      query: (params) => ({ url: "/notifications", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((n) => ({
                type: "Notification" as const,
                id: n.id,
              })),
              { type: "Notification" as const, id: "LIST" },
            ]
          : [{ type: "Notification" as const, id: "LIST" }],
    }),

    unreadNotificationCount: builder.query<{ count: number }, void>({
      query: () => ({ url: "/notifications/unread-count" }),
      providesTags: ["NotificationCount"],
    }),

    markNotificationRead: builder.mutation<NotificationResponse, { id: number }>({
      query: ({ id }) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        "NotificationCount",
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        "NotificationCount",
      ],
    }),

    getStreamTicket: builder.mutation<{ ticket: string }, void>({
      query: () => ({ url: "/notifications/stream-ticket", method: "POST" }),
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetStreamTicketMutation,
} = notificationApi;

export { POLL_INTERVAL_MS };
