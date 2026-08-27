import type { Role } from "@/types/role";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";

export interface StaffProfileResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  cin: string | null;
  hasProfilePicture: boolean;
  phoneNumber: string | null;
  jobTitle: string | null;
  hireDate: string | null;
  officeLocation: string | null;
}

export interface UpdateStaffProfileRequest {
  phoneNumber: string | null;
  jobTitle: string | null;
  hireDate: string | null;
  officeLocation: string | null;
}

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StaffProfile"],
  endpoints: (builder) => ({
    // "Connected" ADMIN/HR gets their own profile (no dedicated management screen —
    // they edit this themselves, unlike employee/doctor profiles).
    getMyStaffProfile: builder.query<StaffProfileResponse, void>({
      query: () => ({ url: "/staff/profile" }),
      providesTags: ["StaffProfile"],
    }),

    updateMyStaffProfile: builder.mutation<
      StaffProfileResponse,
      UpdateStaffProfileRequest
    >({
      query: (body) => ({ url: "/staff/profile", method: "PUT", body }),
      invalidatesTags: ["StaffProfile"],
    }),

    // Read-only view of another Admin/HR user's profile (used from the Admins/HR datatables).
    getStaffProfileById: builder.query<StaffProfileResponse, number>({
      query: (userId) => ({ url: `/staff/profile/${userId}` }),
      providesTags: (_result, _error, userId) => [
        { type: "StaffProfile", id: userId },
      ],
    }),

    // Admin editing another HR/Admin user's profile (e.g. from the Users table's Edit action).
    updateStaffProfileById: builder.mutation<
      StaffProfileResponse,
      { userId: number; body: UpdateStaffProfileRequest }
    >({
      query: ({ userId, body }) => ({
        url: `/staff/profile/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "StaffProfile", id: userId },
      ],
    }),
  }),
});

export const {
  useGetMyStaffProfileQuery,
  useUpdateMyStaffProfileMutation,
  useGetStaffProfileByIdQuery,
  useUpdateStaffProfileByIdMutation,
} = staffApi;
