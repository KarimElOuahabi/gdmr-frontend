import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useRefreshMutation } from "../features/auth/authApi";
import {
  accessTokenSet,
  loggedOut,
  authCheckStarted,
  selectIsCheckingAuth,
} from "../features/auth/authSlice";
import { PageLoader } from "@/components/common/page-loader";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    dispatch(authCheckStarted());
    refresh()
      .unwrap()
      .then((result) => dispatch(accessTokenSet(result.accessToken)))
      .catch(() => dispatch(loggedOut()));
  }, [dispatch, refresh]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
