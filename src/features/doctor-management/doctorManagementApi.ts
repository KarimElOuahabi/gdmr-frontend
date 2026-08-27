import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQueryWithReauth";
import type { DoctorProfileResponse } from "@/features/doctor/doctorApi";
import type { Specialty } from "@/types/specialty";
import type { PagedResponse } from "@/types/pagination";

export interface ListDoctorsParams {
  search?: string;
  page: number;
  size: number;
}

export interface DoctorResponse {
  id: number;
  userId: number;
  phoneNumber: string;
  specialty: Specialty;
  qualifications: string;
  yearsOfExperience: number;
  workSite: string;
  cnssNumber: string | null;
}

export interface UpsertDoctorRequest {
  phoneNumber: string;
  specialty: Specialty;
  qualifications: string;
  yearsOfExperience: number;
  workSite: string;
  cnssNumber?: string | null;
}

export interface UpsertDoctorArg {
  userId: number;
  request: UpsertDoctorRequest;
}

export const doctorManagementApi = createApi({
  reducerPath: "doctorManagementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Doctor"],
  endpoints: (builder) => ({
    listDoctors: builder.query<
      PagedResponse<DoctorProfileResponse>,
      ListDoctorsParams
    >({
      query: ({ search, page = 0, size = 20 }) => ({
        url: "/doctors",
        params: { search, page, size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((doc) => ({
                type: "Doctor" as const,
                id: doc.id,
              })),
              { type: "Doctor" as const, id: "LIST" },
            ]
          : [{ type: "Doctor" as const, id: "LIST" }],
    }),

    // ADMIN/HR get DOCTOR profile by his own id
    getDoctorProfileById: builder.query<DoctorProfileResponse, number>({
      query: (doctorId) => ({
        url: `/doctor/profile/${doctorId}`,
      }),
      providesTags: (_result, _err, id) => [{ type: "Doctor" as const, id }],
    }),

    // ADMIN/HR get DOCTOR profile by the User table id (used from the Users datatable)
    getDoctorProfileByUserId: builder.query<DoctorProfileResponse, number>({
      query: (userId) => ({
        url: `/doctor/profile/user/${userId}`,
      }),
      providesTags: (_result, _err, id) => [{ type: "Doctor" as const, id }],
    }),

    upsertDoctor: builder.mutation<DoctorResponse, UpsertDoctorArg>({
      query: ({ userId, request }) => ({
        url: `/doctor/${userId}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (result, _error, { userId }) => [
        { type: "Doctor" as const, id: userId },
        ...(result?.id ? [{ type: "Doctor" as const, id: result.id }] : []),
        { type: "Doctor" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListDoctorsQuery,
  useGetDoctorProfileByIdQuery,
  useGetDoctorProfileByUserIdQuery,
  useUpsertDoctorMutation,
} = doctorManagementApi;
