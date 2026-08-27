import type { Role } from "@/types/role";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQueryWithReauth";
// Make sure to create this type or just use 'string' if you prefer
import type { Specialty } from "@/types/specialty";

export interface DoctorProfileResponse {
  id: number;
  userId: number; // Replaced doctorId with userId to match the Java record
  email: string;
  firstName: string;
  lastName: string;
  role: Role; // Assuming Role is imported
  active: boolean;
  cin: string | null;
  hasProfilePicture: boolean;
  phoneNumber: string;
  specialty: Specialty; // Assuming Specialty is imported
  qualifications: string;
  yearsOfExperience: number;
  workSite: string;
  cnssNumber: string | null;
}

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Doctor"],
  endpoints: (builder) => ({
    // "Connected" DOCTOR gets his own profile
    getDoctorProfile: builder.query<DoctorProfileResponse, void>({
      query: () => ({
        url: "/doctor/profile",
        method: "GET",
      }),
      providesTags: ["Doctor"],
    }),
    getDoctorById: builder.query<DoctorProfileResponse, number>({
      query: (id) => ({
        // Updated to match your Spring Boot @GetMapping exactly
        url: `/doctor/profile/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDoctorProfileQuery, useGetDoctorByIdQuery } = doctorApi;
