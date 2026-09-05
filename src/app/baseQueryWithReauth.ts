import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { accessTokenSet, loggedOut } from "../features/auth/authSlice";
import { API_BASE_URL } from "@/lib/apiConfig";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // sends the httpOnly refresh cookie automatically
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = typeof args === "string" ? args : args.url;
  // AuthInitializer calls /auth/refresh directly on every app boot (to
  // silently restore a session from the httpOnly cookie), including when
  // there's no valid session at all. If THAT call 401s, it must fail
  // quietly here — retrying /auth/refresh because /auth/refresh itself
  // just failed would recurse forever, and combined with a hard redirect
  // below, turns into an infinite reload loop.
  const isRefreshCall = requestUrl === "/auth/refresh";

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && !isRefreshCall) {
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      api.dispatch(accessTokenSet(accessToken));
      result = await rawBaseQuery(args, api, extraOptions); // retry original request
    } else {
      api.dispatch(loggedOut());
      // Hard navigation, not a client-side route change: every RTK Query
      // api slice keeps its own cache independent of authApi's, so a query
      // with no per-user argument (e.g. getDoctorProfile) would otherwise
      // keep serving stale data to whichever account logs in next in this
      // tab. A full reload guarantees a completely fresh Redux store.
      // Skipped if already on /login so this can't loop.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  return result;
};
