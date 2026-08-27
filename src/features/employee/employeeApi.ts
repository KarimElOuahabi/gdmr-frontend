import type { Role } from "@/types/role";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQueryWithReauth";
import type { Department } from "@/types/department";

export interface EmployeeProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  role: Role;
  cin: string | null;
  hasProfilePicture: boolean;
  employeeId: number;
  birthDate: string;
  department: Department;
  phoneNumber: string | null;
  jobTitle: string | null;
  hireDate: string | null;
  cnssNumber: string | null;
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    // "Connected" EMPLOYEE gets his own profile
    getEmployeeProfile: builder.query<EmployeeProfileResponse, void>({
      query: () => ({
        url: "/employee/profile",
        method: "GET",
      }),
      providesTags: ["Employee"],
    }),
  }),
});

export const { useGetEmployeeProfileQuery } = employeeApi;
