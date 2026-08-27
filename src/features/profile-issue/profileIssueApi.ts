import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";

export interface ReportProfileIssueRequest {
  fieldName: string;
  suggestedCorrection: string;
  note?: string;
}

export interface ProfileIssueResponse {
  id: number;
  fieldName: string;
  suggestedCorrection: string;
  note: string | null;
  resolved: boolean;
  createdAt: string;
}

export const profileIssueApi = createApi({
  reducerPath: "profileIssueApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ProfileIssue"],
  endpoints: (builder) => ({
    reportProfileIssue: builder.mutation<void, ReportProfileIssueRequest>({
      query: (body) => ({ url: "/profile-issues", method: "POST", body }),
    }),

    listProfileIssues: builder.query<ProfileIssueResponse[], number>({
      query: (userId) => ({ url: "/profile-issues", params: { userId } }),
      providesTags: (result, _err, userId) =>
        result
          ? [
              ...result.map((i) => ({ type: "ProfileIssue" as const, id: i.id })),
              { type: "ProfileIssue" as const, id: `LIST-${userId}` },
            ]
          : [{ type: "ProfileIssue" as const, id: `LIST-${userId}` }],
    }),

    resolveProfileIssue: builder.mutation<
      ProfileIssueResponse,
      { id: number; resolved: boolean; userId: number }
    >({
      query: ({ id, resolved }) => ({
        url: `/profile-issues/${id}/resolve`,
        method: "PATCH",
        body: { resolved },
      }),
      invalidatesTags: (_result, _err, { id, userId }) => [
        { type: "ProfileIssue", id },
        { type: "ProfileIssue", id: `LIST-${userId}` },
      ],
    }),
  }),
});

export const {
  useReportProfileIssueMutation,
  useListProfileIssuesQuery,
  useResolveProfileIssueMutation,
} = profileIssueApi;
