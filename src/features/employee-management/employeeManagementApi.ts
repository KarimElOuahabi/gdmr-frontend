import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQueryWithReauth";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";
import type { Department } from "@/types/department";
import type { PagedResponse } from "@/types/pagination";

export interface ListEmployeesParams {
  search?: string;
  idSearch?: string;
  page: number;
  size: number;
}

export interface EmployeeResponse {
  id: number;
  userId: number;
  birthDate: string;
  department: Department;
  phoneNumber: string | null;
  jobTitle: string | null;
  hireDate: string | null;
  cnssNumber: string | null;
}

export interface UpsertEmployeeRequest {
  birthDate: string;
  department: Department;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  hireDate?: string | null;
  cnssNumber?: string | null;
}

export interface UpsertEmployeeArg {
  userId: number;
  request: UpsertEmployeeRequest;
}

export const employeeManagementApi = createApi({
  reducerPath: "employeeManagementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    listEmployees: builder.query<
      PagedResponse<EmployeeProfileResponse>,
      ListEmployeesParams
    >({
      query: ({ search, idSearch, page = 0, size = 20 }) => ({
        url: "/employees",
        params: { search, idSearch, page, size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((emp) => ({
                type: "Employee" as const,
                id: emp.id,
              })),
              { type: "Employee" as const, id: "LIST" },
            ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    // DOCTOR only — employees who have (or had) at least one visit with the
    // logged-in doctor, any status. Backs the doctor's own Patients table.
    listMyPatients: builder.query<
      PagedResponse<EmployeeProfileResponse>,
      ListEmployeesParams
    >({
      query: ({ search, idSearch, page = 0, size = 20 }) => ({
        url: "/employees/my-patients",
        params: { search, idSearch, page, size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((emp) => ({
                type: "Employee" as const,
                id: emp.id,
              })),
              { type: "Employee" as const, id: "LIST" },
            ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    // ADMIN/HR get EMPLOYEE profile by his own id
    getEmployeeProfileById: builder.query<EmployeeProfileResponse, number>({
      query: (employeeId) => ({
        url: `/employee/profile/${employeeId}`,
      }),
      providesTags: (_result, _err, id) => [{ type: "Employee" as const, id }],
    }),

    // ADMIN/HR get EMPLOYEE profile by the User table id (used from the Users datatable)
    getEmployeeProfileByUserId: builder.query<EmployeeProfileResponse, number>({
      query: (userId) => ({
        url: `/employee/profile/user/${userId}`,
      }),
      providesTags: (_result, _err, id) => [{ type: "Employee" as const, id }],
    }),

    upsertEmployee: builder.mutation<EmployeeResponse, UpsertEmployeeArg>({
      query: ({ userId, request }) => ({
        url: `/employee/${userId}`,
        method: "PUT",
        body: request,
      }),
      invalidatesTags: (result, _error, { userId }) => [
        { type: "Employee" as const, id: userId },
        ...(result?.id ? [{ type: "Employee" as const, id: result.id }] : []),
        { type: "Employee" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListEmployeesQuery,
  useListMyPatientsQuery,
  useGetEmployeeProfileByIdQuery,
  useGetEmployeeProfileByUserIdQuery,
  useUpsertEmployeeMutation,
} = employeeManagementApi;
