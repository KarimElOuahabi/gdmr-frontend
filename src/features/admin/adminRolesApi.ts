import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";
import type { Role } from "@/types/role";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface RolesStatsResponse {
  role: Role;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export const adminRolesApi = createApi({
  reducerPath: "adminRolesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RoleStats"],
  endpoints: (builder) => ({
    getRolesStats: builder.query<RolesStatsResponse[], void>({
      query: () => ({
        url: "admin/users/roles/stats",
        method: "GET",
      }),
      providesTags: ["RoleStats"],
    }),
  }),
});

export const { useGetRolesStatsQuery } = adminRolesApi;
