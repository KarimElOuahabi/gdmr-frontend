import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";
import type { PagedResponse } from "@/types/pagination";
import type { VisitStatus, VisitType } from "@/types/visit";

export interface VisitResponse {
  id: number;
  employeeId: number;
  doctorId: number;
  visitType: VisitType;
  status: VisitStatus;
  proposedSlotsByEmployee: string[];
  timeSlotId: number | null;
  confirmedDateTime: string | null;
  motif: string | null;
  reportNotes: string | null;
}

export type NegotiationActor = "EMPLOYEE" | "DOCTOR";

export interface NegotiationEntryResponse {
  id: number;
  visitId: number;
  actor: NegotiationActor;
  reason: string;
  suggestedDateTime: string;
  createdAt: string;
}

export interface ListVisitsParams {
  employeeId?: number;
  doctorId?: number;
  status?: VisitStatus;
  page: number;
  size: number;
}

export const visitApi = createApi({
  reducerPath: "visitApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["visit", "negotiationHistory"],
  endpoints: (builder) => ({
    listVisits: builder.query<PagedResponse<VisitResponse>, ListVisitsParams>({
      query: (params) => ({ url: "/visits", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((v) => ({
                type: "visit" as const,
                id: v.id,
              })),
              { type: "visit" as const, id: "LIST" },
            ]
          : [{ type: "visit" as const, id: "LIST" }],
    }),

    listNegotiationHistory: builder.query<
      NegotiationEntryResponse[],
      { visitId: number }
    >({
      query: ({ visitId }) => ({ url: `/visits/${visitId}/negotiation-history` }),
      providesTags: (_r, _e, { visitId }) => [
        { type: "negotiationHistory" as const, id: visitId },
      ],
    }),

    requestSpontaneousVisit: builder.mutation<
      VisitResponse,
      { doctorUserId: number; motif: string; proposedSlots: string[] }
    >({
      query: ({ doctorUserId, ...body }) => ({
        url: "/visits/spontaneous",
        method: "POST",
        params: { doctorUserId },
        body,
      }),
      invalidatesTags: [{ type: "visit", id: "LIST" }],
    }),

    assignTimeSlot: builder.mutation<
      VisitResponse,
      { id: number; timeSlotId: number }
    >({
      query: ({ id, timeSlotId }) => ({
        url: `/visits/${id}/assign-slot`,
        method: "PATCH",
        body: { timeSlotId },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
      ],
    }),

    createScheduledVisit: builder.mutation<
      VisitResponse,
      { employeeId: number; doctorId: number; timeSlotId: number }
    >({
      query: (body) => ({
        url: "/visits/scheduled",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "visit", id: "LIST" }],
    }),

    confirmVisit: builder.mutation<VisitResponse, { id: number }>({
      query: ({ id }) => ({ url: `/visits/${id}/confirm`, method: "PATCH" }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
      ],
    }),

    rejectVisitByEmployee: builder.mutation<
      VisitResponse,
      { id: number; reason: string; suggestedDateTime: string }
    >({
      query: ({ id, reason, suggestedDateTime }) => ({
        url: `/visits/${id}/employee-reject`,
        method: "PATCH",
        body: { reason, suggestedDateTime },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
        { type: "negotiationHistory", id },
      ],
    }),

    confirmVisitByDoctor: builder.mutation<VisitResponse, { id: number }>({
      query: ({ id }) => ({
        url: `/visits/${id}/doctor-confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
      ],
    }),

    rejectVisitByDoctor: builder.mutation<
      VisitResponse,
      { id: number; reason: string; suggestedDateTime: string }
    >({
      query: ({ id, reason, suggestedDateTime }) => ({
        url: `/visits/${id}/doctor-reject`,
        method: "PATCH",
        body: { reason, suggestedDateTime },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
        { type: "negotiationHistory", id },
      ],
    }),

    updateVisitStatus: builder.mutation<
      VisitResponse,
      { id: number; status: VisitStatus }
    >({
      query: ({ id, status }) => ({
        url: `/visits/${id}/status`,
        method: "PATCH",
        params: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
      ],
    }),

    submitVisitReport: builder.mutation<
      VisitResponse,
      { id: number; reportNotes: string }
    >({
      query: ({ id, reportNotes }) => ({
        url: `/visits/${id}/report`,
        method: "PATCH",
        params: { reportNotes },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "visit", id },
        { type: "visit", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListVisitsQuery,
  useListNegotiationHistoryQuery,
  useRequestSpontaneousVisitMutation,
  useAssignTimeSlotMutation,
  useCreateScheduledVisitMutation,
  useConfirmVisitMutation,
  useRejectVisitByEmployeeMutation,
  useConfirmVisitByDoctorMutation,
  useRejectVisitByDoctorMutation,
  useUpdateVisitStatusMutation,
  useSubmitVisitReportMutation,
} = visitApi;
