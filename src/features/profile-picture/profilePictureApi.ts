import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/baseQueryWithReauth";
import { API_BASE_URL as PROFILE_PICTURE_API_BASE_URL } from "@/lib/apiConfig";

interface AuthOnlyState {
  auth: { accessToken: string | null };
}

export const profilePictureApi = createApi({
  reducerPath: "profilePictureApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ProfilePicture"],
  endpoints: (builder) => ({
    // Fetches the picture bytes with the auth header (an <img> tag can't send
    // one) and hands back a local blob URL to render — mirrors how document
    // downloads are already done in this app.
    getProfilePictureUrl: builder.query<string, number>({
      queryFn: async (userId, api) => {
        const token = (api.getState() as AuthOnlyState).auth.accessToken;
        try {
          const res = await fetch(
            `${PROFILE_PICTURE_API_BASE_URL}/users/${userId}/profile-picture`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} },
          );
          if (!res.ok) {
            return { error: { status: res.status, data: "Not found" } } as const;
          }
          const blob = await res.blob();
          return { data: URL.createObjectURL(blob) };
        } catch {
          return {
            error: { status: "FETCH_ERROR", error: "Failed to load picture" },
          } as const;
        }
      },
      providesTags: (_result, _err, userId) => [
        { type: "ProfilePicture" as const, id: userId },
      ],
      // The query cache holds an object URL — release it once nothing needs
      // it anymore instead of leaking it for the life of the tab.
      onCacheEntryAdded: async (_userId, { cacheDataLoaded, cacheEntryRemoved, getCacheEntry }) => {
        await cacheDataLoaded;
        await cacheEntryRemoved;
        const url = getCacheEntry().data;
        if (url) URL.revokeObjectURL(url);
      },
    }),

    uploadProfilePicture: builder.mutation<
      { hasProfilePicture: boolean },
      { userId: number; file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/users/me/profile-picture", method: "POST", body: formData };
      },
      invalidatesTags: (_result, _err, { userId }) => [
        { type: "ProfilePicture" as const, id: userId },
      ],
    }),

    deleteProfilePicture: builder.mutation<void, { userId: number }>({
      query: () => ({ url: "/users/me/profile-picture", method: "DELETE" }),
      invalidatesTags: (_result, _err, { userId }) => [
        { type: "ProfilePicture" as const, id: userId },
      ],
    }),
  }),
});

export const {
  useGetProfilePictureUrlQuery,
  useUploadProfilePictureMutation,
  useDeleteProfilePictureMutation,
} = profilePictureApi;
