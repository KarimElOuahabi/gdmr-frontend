import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";
import { adminUsersApi } from "../features/admin/adminUsersApi";
import { adminRolesApi } from "../features/admin/adminRolesApi";
import { employeeApi } from "../features/employee/employeeApi";
import { employeeManagementApi } from "../features/employee-management/employeeManagementApi";
import { doctorApi } from "@/features/doctor/doctorApi";
import { doctorManagementApi } from "../features/doctor-management/doctorManagementApi";
import { timeSlotApi } from "@/features/timeslot/timeSlotApi";
import { visitApi } from "@/features/visit/visitApi";
import { notificationApi } from "@/features/notification/notificationApi";
import { documentApi } from "@/features/document/documentApi";
import { medicalHistoryApi } from "@/features/medical-history/medicalHistoryApi";
import { staffApi } from "@/features/staff/staffApi";
import { profileIssueApi } from "@/features/profile-issue/profileIssueApi";
import { profilePictureApi } from "@/features/profile-picture/profilePictureApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
    [adminRolesApi.reducerPath]: adminRolesApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [employeeManagementApi.reducerPath]: employeeManagementApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [doctorManagementApi.reducerPath]: doctorManagementApi.reducer,
    [timeSlotApi.reducerPath]: timeSlotApi.reducer,
    [visitApi.reducerPath]: visitApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [medicalHistoryApi.reducerPath]: medicalHistoryApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [profileIssueApi.reducerPath]: profileIssueApi.reducer,
    [profilePictureApi.reducerPath]: profilePictureApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      adminUsersApi.middleware,
      adminRolesApi.middleware,
      employeeApi.middleware,
      employeeManagementApi.middleware,
      doctorApi.middleware,
      doctorManagementApi.middleware,
      timeSlotApi.middleware,
      visitApi.middleware,
      notificationApi.middleware,
      documentApi.middleware,
      medicalHistoryApi.middleware,
      staffApi.middleware,
      profileIssueApi.middleware,
      profilePictureApi.middleware,
    ),
});

// Enables RTK Query's refetchOnFocus/refetchOnReconnect behavior (window focus,
// tab visibility, network reconnect) — without this, those options do nothing.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
