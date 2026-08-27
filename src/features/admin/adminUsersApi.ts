import type { Role } from "@/types/role";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQueryWithReauth";
import type { Department } from "@/types/department";
import type { Specialty } from "@/types/specialty";
import type { PagedResponse } from "@/types/pagination";

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  cin: string | null;
  hasProfilePicture: boolean;
}

export interface ListUsersParams {
  search?: string;
  role?: Role;
  active?: boolean;
  page: number;
  size: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  role: Role;
  cin?: string | null;
  employeeInfo?: {
    birthDate: string;
    department: Department;
    phoneNumber?: string | null;
    jobTitle?: string | null;
    hireDate?: string | null;
    cnssNumber?: string | null;
  };
  doctorInfo?: {
    phoneNumber: string;
    specialty: Specialty;
    qualifications: string;
    yearsOfExperience: number;
    workSite: string;
    cnssNumber?: string | null;
  };
  staffInfo?: {
    phoneNumber?: string | null;
    jobTitle?: string | null;
    hireDate?: string | null;
    officeLocation?: string | null;
  };
}

export interface CreateUserResponse {
  user: UserResponse;
  temporaryPassword: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  role: Role;
  cin?: string | null;
}

export const adminUsersApi = createApi({
  reducerPath: "adminUsersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    listUsers: builder.query<PagedResponse<UserResponse>, ListUsersParams>({
      query: ({ search, role, active, page, size }) => ({
        url: "/admin/users",
        params: { search, role, active, page, size },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((u) => ({
                type: "User" as const,
                id: u.id,
              })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),
    createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: (body) => ({ url: "/admin/users", method: "POST", body }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation<
      UserResponse,
      { id: number; body: UpdateUserRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
    changeUserStatus: builder.mutation<void, { id: number; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserStatusMutation,
} = adminUsersApi;
