import {
  createSlice,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import type { RootState } from "../../app/store";
import type { Role } from "@/types/role";
interface AuthState {
  accessToken: string | null;
  isCheckingAuth: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  isCheckingAuth: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    accessTokenSet: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isCheckingAuth = false;
    },
    loggedOut: (state) => {
      state.accessToken = null;
      state.isCheckingAuth = false;
    },
    authCheckStarted: (state) => {
      state.isCheckingAuth = true;
    },
    authCheckFinished: (state) => {
      state.isCheckingAuth = false;
    },
  },
});

export const { accessTokenSet, loggedOut, authCheckStarted } =
  authSlice.actions;
export default authSlice.reducer;

export interface DecodedAccessToken {
  sub: string;
  userId: number;
  role: Role;
  exp: number;
}

export const selectAccessToken = (state: RootState) => state.auth.accessToken;

export const selectIsAuthenticated = (state: RootState) =>
  !!state.auth.accessToken;

export const selectIsCheckingAuth = (state: RootState) =>
  state.auth.isCheckingAuth;

export const selectCurrentUser = createSelector(
  [selectAccessToken],
  (token): DecodedAccessToken | null =>
    token ? jwtDecode<DecodedAccessToken>(token) : null,
);

export const selectRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role ?? null,
);
