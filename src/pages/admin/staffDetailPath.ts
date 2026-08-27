import type { Role } from "@/types/role";

export function buildStaffDetailPath(userId: number): string {
  return `/admin/staff/${userId}`;
}

// The Users/Admins/HR datatables only carry the raw User table id, and each
// role's detail page is keyed differently (Employee/Doctor entities have their
// own primary key, distinct from the User id) — route by role accordingly.
export function buildUserProfilePath(role: Role, userId: number): string {
  switch (role) {
    case "EMPLOYEE":
      return `/admin/employees/by-user/${userId}`;
    case "DOCTOR":
      return `/admin/doctors/by-user/${userId}`;
    default:
      return buildStaffDetailPath(userId);
  }
}
