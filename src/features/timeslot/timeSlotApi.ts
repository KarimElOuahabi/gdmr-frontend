import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";
import type { VisitType } from "@/types/visit";
import type { PagedResponse } from "@/types/pagination";

export interface TimeSlotResponse {
  id: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  visitType: VisitType;
  available: boolean;
}

export interface CreateTimeSlotRequest {
  doctorId: number;
  startTime: string;
  endTime: string;
  visitType: VisitType;
}

export interface ListTimeSlotsParams {
  doctorId?: number;
  availableOnly?: boolean;
  visitType?: VisitType;
  page: number;
  size: number;
}

export const timeSlotApi = createApi({
  reducerPath: "timeSlotApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TimeSlot"],
  endpoints: (builder) => ({
    listTimeSlots: builder.query<
      PagedResponse<TimeSlotResponse>,
      ListTimeSlotsParams
    >({
      query: (params) => ({ url: "/timeslots", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((c) => ({
                type: "TimeSlot" as const,
                id: c.id,
              })),
              { type: "TimeSlot" as const, id: "LIST" },
            ]
          : [{ type: "TimeSlot" as const, id: "LIST" }],
    }),
    createTimeSlot: builder.mutation<TimeSlotResponse, CreateTimeSlotRequest>({
      query: (body) => ({ url: "/timeslot", method: "POST", body }),
      invalidatesTags: [{ type: "TimeSlot", id: "LIST" }],
    }),
  }),
});

export const { useListTimeSlotsQuery, useCreateTimeSlotMutation } = timeSlotApi;
