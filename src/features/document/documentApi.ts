import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";
import { API_BASE_URL as DOCUMENTS_API_BASE_URL } from "@/lib/apiConfig";

export type DocumentType =
  | "EXAMINATION_REPORT"
  | "MEDICAL_CERTIFICATE"
  | "PRESCRIPTION"
  | "FITNESS_CERTIFICATE";

export interface MedicalDocumentResponse {
  id: number;
  employeeId: number;
  visitId: number | null;
  documentType: DocumentType;
  originalFilename: string;
  version: number;
  previousVersionId: number | null;
  createdAt: string;
}

interface AuthOnlyState {
  auth: { accessToken: string | null };
}

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Document"],
  endpoints: (builder) => ({
    // Employee viewing their own documents (server resolves "self" from the token).
    listMyDocuments: builder.query<MedicalDocumentResponse[], void>({
      query: () => ({ url: "/documents/employee/0" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Document" as const, id: d.id })),
              { type: "Document" as const, id: "LIST" },
            ]
          : [{ type: "Document" as const, id: "LIST" }],
    }),

    // Doctor viewing a specific employee's documents (by domain employeeId, from a visit).
    listDocumentsByEmployeeId: builder.query<
      MedicalDocumentResponse[],
      { employeeId: number }
    >({
      query: ({ employeeId }) => ({ url: "/documents", params: { employeeId } }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Document" as const, id: d.id })),
              { type: "Document" as const, id: "LIST" },
            ]
          : [{ type: "Document" as const, id: "LIST" }],
    }),

    uploadDocument: builder.mutation<
      MedicalDocumentResponse,
      {
        documentType: DocumentType;
        file: File;
        employeeId?: number; // doctor path
        employeeUserId?: number; // HR path (attaching on an employee's behalf)
        visitId?: number;
        previousVersionId?: number;
      }
    >({
      query: ({ documentType, file, employeeId, employeeUserId, visitId, previousVersionId }) => {
        const formData = new FormData();
        formData.append("documentType", documentType);
        formData.append("file", file);
        // Ignored by the server for EMPLOYEE callers, but the field is required —
        // any value works for them; doctors instead pass the real employeeId.
        formData.append("employeeUserId", employeeUserId != null ? String(employeeUserId) : "0");
        if (employeeId != null) formData.append("employeeId", String(employeeId));
        if (visitId != null) formData.append("visitId", String(visitId));
        if (previousVersionId != null)
          formData.append("previousVersionId", String(previousVersionId));
        return { url: "/documents", method: "POST", body: formData };
      },
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),

    deleteDocument: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({ url: `/documents/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),

    downloadDocument: builder.mutation<
      void,
      { id: number; filename: string }
    >({
      async queryFn({ id, filename }, api) {
        const token = (api.getState() as AuthOnlyState).auth.accessToken;
        try {
          const res = await fetch(
            `${DOCUMENTS_API_BASE_URL}/documents/${id}/download`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              credentials: "include",
            },
          );
          if (!res.ok) {
            return {
              error: { status: res.status, data: "Download failed" },
            } as const;
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          return { data: undefined };
        } catch {
          return {
            error: { status: "FETCH_ERROR", error: "Download failed" },
          } as const;
        }
      },
    }),
  }),
});

export const {
  useListMyDocumentsQuery,
  useListDocumentsByEmployeeIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useDownloadDocumentMutation,
} = documentApi;
