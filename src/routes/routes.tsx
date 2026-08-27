// ============================================================================
// 1. EXTERNAL DEPENDENCIES & ICONS
// ============================================================================
import type { RouteObject } from "react-router";
import {
  Users,
  UserCog,
  ShieldCheck,
  Briefcase,
  Stethoscope,
  User,
  Calendar,
  CalendarPlus,
  Bell,
  FolderOpen,
  Inbox,
  CalendarCheck,
  PlayCircle,
  BadgeCheck,
  LayoutDashboard,
} from "lucide-react";

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================
import type { RouteItem } from "../types/route";
import type { Role } from "../types/role";

// ============================================================================
// 3. LAYOUTS & SHARED COMPONENTS
// ============================================================================
import { AuthenticatedLayout } from "../components/layouts/AuthenticatedLayout";
import { UnauthenticatedLayout } from "../components/layouts/UnauthenticatedLayout";
import { RequireRole } from "@/features/auth/components/require-role";

// ============================================================================
// 4. PAGES (GROUPED BY ROLE)
// ============================================================================

// --- PUBLIC & ERROR PAGES ---
import { LoginPage } from "../pages/LoginPage";
import { NotFound } from "../pages/errors/NotFound";

// --- ADMIN PAGES ---
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { UsersPage } from "@/pages/admin/UsersPage";
import { AdminRolesPage } from "@/pages/admin/AdminRolesPage";
import { AdminsPage } from "@/pages/admin/AdminsPage";
import { HrsPage } from "@/pages/admin/HrsPage";
import { StaffDetailPage } from "@/pages/admin/StaffDetailPage";
import { ProfileIssueResolverPage } from "@/pages/admin/ProfileIssueResolverPage";

// --- HR PAGES ---
import { HrDashboard } from "@/pages/hr/HrDashboard";
import { VisitRequestsPage } from "@/pages/hr/VisitRequestsPage";
import { CreateVisitPage } from "@/pages/hr/CreateVisitPage";

// --- DOCTOR PAGES ---
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";
import { VisitRequestsPage as DoctorVisitRequestsPage } from "@/pages/doctor/VisitRequestsPage";
import { UpcomingVisitsPage } from "@/pages/doctor/UpcomingVisitsPage";
import { VisitsInProgressPage } from "@/pages/doctor/VisitsInProgressPage";
import { CompletedVisitsPage } from "@/pages/doctor/CompletedVisitsPage";
import { PatientsPage } from "@/pages/doctor/PatientsPage";
import { PatientDetailPage } from "@/pages/doctor/PatientDetailPage";
import { DoctorProfilePage } from "@/pages/doctor/DoctorProfilePage";

// --- EMPLOYEE PAGES ---
import { EmployeeDashboard } from "@/pages/employee/EmployeeDashboard";
import { EmployeeProfilePage } from "@/pages/employee/EmployeeProfilePage";
import { SelectDoctorPage } from "@/pages/employee/SelectDoctorPage";
import { RequestVisitPage } from "@/pages/employee/RequestVisitPage";
import { ProposedVisits as ProposedVisitsPage } from "@/pages/employee/ProposedVisitsPage";

// --- MANAGEMENT PAGES (SHARED: ADMIN & HR) ---
import { EmployeesList } from "@/pages/employee-management/EmployeesList";
import { EmployeeDetailPage } from "@/pages/employee-management/EmployeeDetailPage";
import { EmployeeDetailByUserPage } from "@/pages/employee-management/EmployeeDetailByUserPage";
import { DoctorsList } from "@/pages/doctor-management/DoctorsList";
import { DoctorDetailPage } from "@/pages/doctor-management/DoctorDetailPage";
import { DoctorDetailByUserPage } from "@/pages/doctor-management/DoctorDetailByUserPage";
import { VisitsPage } from "@/pages/admin/VisitsPage";
import { Appointments } from "@/pages/employee/Appointments";
import { DocumentsPage } from "@/pages/employee/DocumentsPage";

// --- SHARED (ALL ROLES) ---
import { NotificationsPage } from "@/pages/NotificationsPage";
import { MyProfilePage } from "@/pages/MyProfilePage";

// ============================================================================
// ROUTE DEFINITIONS CONSTANT
// ============================================================================
export const ROUTES = {
  // -------------------------
  // PUBLIC ROUTES
  // -------------------------
  LOGIN: {
    key: "LOGIN",
    label: "Login",
    path: "/login",
  },

  // -------------------------
  // ADMIN ROUTES
  // -------------------------
  ADMIN_DASHBOARD: {
    key: "ADMIN_DASHBOARD",
    label: "Dashboard",
    path: "/admin_dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
    group: "Overview",
  },
  USERS: {
    key: "USERS",
    label: "Users",
    path: "/users",
    icon: Users,
    roles: ["ADMIN"],
    group: "User Management",
  },
  ADMIN_ROLES: {
    key: "ADMIN_ROLES",
    label: "Roles",
    path: "/admin_roles",
    icon: UserCog,
    roles: ["ADMIN"],
    group: "User Management",
  },
  ADMINS: {
    key: "ADMINS",
    label: "Admins",
    path: "/admins",
    icon: ShieldCheck,
    roles: ["ADMIN"],
    group: "User Management",
  },
  HRS: {
    key: "HRS",
    label: "HR",
    path: "/hrs",
    icon: Briefcase,
    roles: ["ADMIN", "HR"],
    group: "User Management",
  },
  STAFF_DETAIL: {
    key: "STAFF_DETAIL",
    label: "Staff Detail",
    path: "/admin/staff/:userId",
    roles: ["ADMIN", "HR"],
  },
  PROFILE_ISSUE_RESOLVER: {
    key: "PROFILE_ISSUE_RESOLVER",
    label: "Profile Issue",
    path: "/admin/profile-issues/:userId",
    roles: ["ADMIN", "HR"],
  },

  // -------------------------
  // HR ROUTES
  // -------------------------
  HR_DASHBOARD: {
    key: "HR_DASHBOARD",
    label: "HR Dashboard",
    path: "/hr_dashboard",
    icon: Briefcase,
    roles: ["HR"],
    group: "Overview",
  },
  VISIT_REQUESTS: {
    key: "VISIT_REQUESTS",
    label: "Visit Requests",
    path: "/hr/visit-requests",
    icon: Calendar,
    roles: ["HR"],
    group: "Visits",
  },
  CREATE_VISIT: {
    key: "CREATE_VISIT",
    label: "Schedule a Visit",
    path: "/hr/create-visit",
    icon: CalendarPlus,
    roles: ["HR"],
    group: "Visits",
  },

  // -------------------------
  // DOCTOR ROUTES
  // -------------------------
  DOCTOR_DASHBOARD: {
    key: "DOCTOR_DASHBOARD",
    label: "Doctor Dashboard",
    path: "/doctor_dashboard",
    icon: Stethoscope,
    roles: ["DOCTOR"],
    group: "Overview",
  },
  DOCTOR_PROFILE: {
    key: "DOCTOR_PROFILE",
    label: "My Profile",
    path: "/doctor/profile",
    roles: ["DOCTOR"],
    isProfilePopoverItem: true, // Appears in the top-right user menu
  },
  DOCTOR_VISIT_REQUESTS: {
    key: "DOCTOR_VISIT_REQUESTS",
    label: "Visit Requests",
    path: "/doctor/visit-requests",
    icon: Inbox,
    roles: ["DOCTOR"],
    group: "Visits",
  },
  DOCTOR_UPCOMING_VISITS: {
    key: "DOCTOR_UPCOMING_VISITS",
    label: "Upcoming Visits",
    path: "/doctor/upcoming-visits",
    icon: CalendarCheck,
    roles: ["DOCTOR"],
    group: "Visits",
  },
  DOCTOR_VISITS_IN_PROGRESS: {
    key: "DOCTOR_VISITS_IN_PROGRESS",
    label: "Visits In Progress",
    path: "/doctor/visits-in-progress",
    icon: PlayCircle,
    roles: ["DOCTOR"],
    group: "Visits",
  },
  DOCTOR_COMPLETED_VISITS: {
    key: "DOCTOR_COMPLETED_VISITS",
    label: "Completed Visits",
    path: "/doctor/completed-visits",
    icon: BadgeCheck,
    roles: ["DOCTOR"],
    group: "Visits",
  },
  DOCTOR_PATIENTS: {
    key: "DOCTOR_PATIENTS",
    label: "Patients",
    path: "/doctor/patients",
    icon: Users,
    roles: ["DOCTOR"],
    group: "Patients",
  },
  DOCTOR_PATIENT_DETAIL: {
    key: "DOCTOR_PATIENT_DETAIL",
    label: "Patient Detail",
    path: "/doctor/patients/:employeeId",
    roles: ["DOCTOR"],
  },

  // -------------------------
  // EMPLOYEE ROUTES
  // -------------------------
  EMPLOYEE_DASHBOARD: {
    key: "EMPLOYEE_DASHBOARD",
    label: "Employee Dashboard",
    path: "/employee_dashboard",
    icon: User,
    roles: ["EMPLOYEE"],
    group: "Overview",
  },
  EMPLOYEE_PROFILE: {
    key: "EMPLOYEE_PROFILE",
    label: "My Profile",
    path: "/employee/profile",
    roles: ["EMPLOYEE"],
    isProfilePopoverItem: true, // Appears in the top-right user menu
  },
  SELECT_DOCTOR: {
    key: "SELECT_DOCTOR",
    label: "Select Doctor",
    path: "/employee/doctors",
    icon: Stethoscope,
    roles: ["EMPLOYEE"],
    group: "Visits",
  },
  REQUEST_VISIT: {
    key: "REQUEST_VISIT",
    label: "Request Visit",
    path: "/employee/doctors/:doctorId/request",
    roles: ["EMPLOYEE"], // No icon = hidden from sidebar
  },
  PROPOSED_VISITS: {
    key: "PROPOSED_VISITS",
    label: "Proposed Visits",
    path: "/employee/proposed-visits",
    icon: Calendar,
    roles: ["EMPLOYEE"],
    group: "Visits",
  },
  APPOINTMENTS: {
    key: "APPOINTMENTS",
    label: "My Appointments",
    path: "/employee/appointments",
    icon: Calendar,
    roles: ["EMPLOYEE"],
    group: "Visits",
  },
  EMPLOYEE_DOCUMENTS: {
    key: "EMPLOYEE_DOCUMENTS",
    label: "My Documents",
    path: "/employee/documents",
    icon: FolderOpen,
    roles: ["EMPLOYEE"],
    group: "Documents",
  },

  // -------------------------
  // SHARED ROUTES (ADMIN & HR)
  // -------------------------
  EMPLOYEE_PAGE: {
    key: "EMPLOYEE_PAGE",
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: ["ADMIN", "HR"],
    group: "User Management",
  },
  DOCTOR_PAGE: {
    key: "DOCTOR_PAGE",
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
    roles: ["ADMIN", "HR"],
    group: "User Management",
  },
  VISITS: {
    key: "VISITS",
    label: "Visits",
    path: "/visits",
    icon: Stethoscope,
    roles: ["ADMIN", "HR"],
    group: "Visits",
  },
  EMPLOYEE_DETAIL: {
    key: "EMPLOYEE_DETAIL",
    label: "Employee Detail",
    path: "/admin/employees/:employeeId",
    roles: ["ADMIN", "HR"],
  },
  EMPLOYEE_DETAIL_BY_USER: {
    key: "EMPLOYEE_DETAIL_BY_USER",
    label: "Employee Detail",
    path: "/admin/employees/by-user/:userId",
    roles: ["ADMIN", "HR"],
  },
  DOCTOR_DETAIL: {
    key: "DOCTOR_DETAIL",
    label: "Doctor Detail",
    path: "/admin/doctors/:doctorId",
    roles: ["ADMIN", "HR"],
  },
  DOCTOR_DETAIL_BY_USER: {
    key: "DOCTOR_DETAIL_BY_USER",
    label: "Doctor Detail",
    path: "/admin/doctors/by-user/:userId",
    roles: ["ADMIN", "HR"],
  },
  MY_PROFILE: {
    key: "MY_PROFILE",
    label: "My Profile",
    path: "/profile",
    // No icon — like DOCTOR_PROFILE/EMPLOYEE_PROFILE, reached only via the
    // sidebar footer avatar link, not as its own sidebar nav button.
    roles: ["ADMIN", "HR"],
    isProfilePopoverItem: true,
  },

  // -------------------------
  // SHARED (ALL ROLES)
  // -------------------------
  NOTIFICATIONS: {
    key: "NOTIFICATIONS",
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
    roles: ["ADMIN", "HR", "DOCTOR", "EMPLOYEE"],
    group: "General",
  },
} as const satisfies Record<string, RouteItem>;

export const ROUTE_LIST: RouteItem[] = Object.values(ROUTES);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts routes that should appear in the main sidebar navigation based on role.
 * Ignores routes without icons. A route can also be a profile-popover item (like
 * MY_PROFILE) and still show up here as long as it has an icon — the two lists
 * aren't mutually exclusive, `isProfilePopoverItem` alone just hides icon-less
 * routes (EMPLOYEE_PROFILE, DOCTOR_PROFILE) that are only meant to be reached
 * from the sidebar footer.
 */
export function getSidebarRoutes(role: Role | undefined): RouteItem[] {
  return ROUTE_LIST.filter((route) => {
    if (!route.icon) return false;
    if (!route.roles) return true; // Public routes with icons
    if (!role) return false;
    return route.roles.includes(role);
  });
}

// Fixed display order for sidebar sections — anything without a `group` falls
// back to "General" and renders last.
const SIDEBAR_GROUP_ORDER = [
  "Overview",
  "User Management",
  "Visits",
  "Patients",
  "Documents",
  "General",
];

// HR can only view the Employees/Doctors/HR lists (no create/edit/roles like
// Admin) — "User Management" implies more control than HR actually has.
const SIDEBAR_GROUP_LABEL_OVERRIDES: Partial<Record<Role, Record<string, string>>> = {
  HR: { "User Management": "Directory" },
};

export interface SidebarGroup {
  label: string;
  routes: RouteItem[];
}

/**
 * Buckets the current role's sidebar routes into labeled sections
 * (Overview, User Management, Visits, ...), preserving SIDEBAR_GROUP_ORDER
 * and dropping any section that ends up empty for this role.
 */
export function getSidebarGroups(role: Role | undefined): SidebarGroup[] {
  const routes = getSidebarRoutes(role);
  const overrides = role ? SIDEBAR_GROUP_LABEL_OVERRIDES[role] : undefined;
  return SIDEBAR_GROUP_ORDER.map((label) => ({
    label: overrides?.[label] ?? label,
    routes: routes.filter((route) => (route.group ?? "General") === label),
  })).filter((group) => group.routes.length > 0);
}

/**
 * Extracts routes specifically flagged for the user profile dropdown menu.
 */
export function getProfilePopoverRoutes(role: Role | undefined): RouteItem[] {
  return ROUTE_LIST.filter((route) => {
    if (!route.isProfilePopoverItem) return false;
    if (!route.roles) return true;
    if (!role) return false;
    return route.roles.includes(role);
  });
}

// ============================================================================
// REACT ROUTER CONFIGURATION ARRAYS
// ============================================================================

// --- PUBLIC ROUTES ---
export const unauthenticatedRoutes: RouteObject[] = [
  {
    element: <UnauthenticatedLayout />,
    children: [{ path: ROUTES.LOGIN.path, element: <LoginPage /> }],
  },
];

// --- PROTECTED ROUTES ---
export const authenticatedRoutes: RouteObject[] = [
  {
    element: <AuthenticatedLayout />,
    children: [
      // 1. ADMIN ONLY
      {
        element: <RequireRole allowedRoles={["ADMIN"]} />,
        children: [
          { path: ROUTES.ADMIN_DASHBOARD.path, element: <AdminDashboard /> },
          { path: ROUTES.USERS.path, element: <UsersPage /> },
          { path: ROUTES.ADMIN_ROLES.path, element: <AdminRolesPage /> },
          { path: ROUTES.ADMINS.path, element: <AdminsPage /> },
        ],
      },
      // 2. HR ONLY
      {
        element: <RequireRole allowedRoles={["HR"]} />,
        children: [
          { path: ROUTES.HR_DASHBOARD.path, element: <HrDashboard /> },
          { path: ROUTES.VISIT_REQUESTS.path, element: <VisitRequestsPage /> },
          { path: ROUTES.CREATE_VISIT.path, element: <CreateVisitPage /> },
        ],
      },
      // 3. DOCTOR ONLY
      {
        element: <RequireRole allowedRoles={["DOCTOR"]} />,
        children: [
          { path: ROUTES.DOCTOR_DASHBOARD.path, element: <DoctorDashboard /> },
          {
            path: ROUTES.DOCTOR_VISIT_REQUESTS.path,
            element: <DoctorVisitRequestsPage />,
          },
          {
            path: ROUTES.DOCTOR_UPCOMING_VISITS.path,
            element: <UpcomingVisitsPage />,
          },
          {
            path: ROUTES.DOCTOR_VISITS_IN_PROGRESS.path,
            element: <VisitsInProgressPage />,
          },
          {
            path: ROUTES.DOCTOR_COMPLETED_VISITS.path,
            element: <CompletedVisitsPage />,
          },
          { path: ROUTES.DOCTOR_PATIENTS.path, element: <PatientsPage /> },
          {
            path: ROUTES.DOCTOR_PATIENT_DETAIL.path,
            element: <PatientDetailPage />,
          },
          { path: ROUTES.DOCTOR_PROFILE.path, element: <DoctorProfilePage /> },
        ],
      },
      // 4. EMPLOYEE ONLY
      {
        element: <RequireRole allowedRoles={["EMPLOYEE"]} />,
        children: [
          {
            path: ROUTES.EMPLOYEE_DASHBOARD.path,
            element: <EmployeeDashboard />,
          },
          {
            path: ROUTES.EMPLOYEE_PROFILE.path,
            element: <EmployeeProfilePage />,
          },
          { path: ROUTES.SELECT_DOCTOR.path, element: <SelectDoctorPage /> },
          { path: ROUTES.REQUEST_VISIT.path, element: <RequestVisitPage /> },
          {
            path: ROUTES.PROPOSED_VISITS.path,
            element: <ProposedVisitsPage />,
          },
          {
            path: ROUTES.APPOINTMENTS.path,
            element: <Appointments />,
          },
          {
            path: ROUTES.EMPLOYEE_DOCUMENTS.path,
            element: <DocumentsPage />,
          },
        ],
      },
      // 5. SHARED (ADMIN & HR)
      {
        element: <RequireRole allowedRoles={["ADMIN", "HR"]} />,
        children: [
          { path: ROUTES.EMPLOYEE_PAGE.path, element: <EmployeesList /> },
          {
            path: ROUTES.EMPLOYEE_DETAIL.path,
            element: <EmployeeDetailPage />,
          },
          {
            path: ROUTES.EMPLOYEE_DETAIL_BY_USER.path,
            element: <EmployeeDetailByUserPage />,
          },
          { path: ROUTES.DOCTOR_PAGE.path, element: <DoctorsList /> },
          { path: ROUTES.DOCTOR_DETAIL.path, element: <DoctorDetailPage /> },
          {
            path: ROUTES.DOCTOR_DETAIL_BY_USER.path,
            element: <DoctorDetailByUserPage />,
          },
          { path: ROUTES.VISITS.path, element: <VisitsPage /> },
          { path: ROUTES.MY_PROFILE.path, element: <MyProfilePage /> },
          { path: ROUTES.HRS.path, element: <HrsPage /> },
          { path: ROUTES.STAFF_DETAIL.path, element: <StaffDetailPage /> },
          {
            path: ROUTES.PROFILE_ISSUE_RESOLVER.path,
            element: <ProfileIssueResolverPage />,
          },
        ],
      },
      // 6. SHARED (ALL AUTHENTICATED ROLES)
      {
        element: (
          <RequireRole allowedRoles={["ADMIN", "HR", "DOCTOR", "EMPLOYEE"]} />
        ),
        children: [
          { path: ROUTES.NOTIFICATIONS.path, element: <NotificationsPage /> },
        ],
      },
    ],
  },
];

// --- FALLBACK ROUTES ---
export const fallbackRoutes: RouteObject[] = [
  { path: "*", element: <NotFound /> },
];
