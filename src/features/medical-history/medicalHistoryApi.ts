import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";

export type MedicalHistoryCategory =
  | "ALLERGY"
  | "CHRONIC_CONDITION"
  | "SURGERY"
  | "VACCINATION"
  | "FAMILY_HISTORY"
  | "OTHER";

export interface MedicalHistoryEntryResponse {
  id: number;
  employeeId: number;
  doctorId: number;
  visitId: number | null;
  category: MedicalHistoryCategory;
  description: string;
  createdAt: string;
}

export const medicalHistoryApi = createApi({
  reducerPath: "medicalHistoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["MedicalHistory"],
  endpoints: (builder) => ({
    listMedicalHistory: builder.query<
      MedicalHistoryEntryResponse[],
      { employeeId: number }
    >({
      query: ({ employeeId }) => ({ url: `/medical-history/employee/${employeeId}` }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "MedicalHistory" as const, id: e.id })),
              { type: "MedicalHistory" as const, id: "LIST" },
            ]
          : [{ type: "MedicalHistory" as const, id: "LIST" }],
    }),

    addMedicalHistoryEntry: builder.mutation<
      MedicalHistoryEntryResponse,
      {
        employeeId: number;
        visitId?: number;
        category: MedicalHistoryCategory;
        description: string;
      }
    >({
      query: (body) => ({ url: "/medical-history", method: "POST", body }),
      invalidatesTags: [{ type: "MedicalHistory", id: "LIST" }],
    }),
  }),
});

export const { useListMedicalHistoryQuery, useAddMedicalHistoryEntryMutation } =
  medicalHistoryApi;
