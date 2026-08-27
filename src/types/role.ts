export const ALL_ROLES = ["ADMIN", "HR", "DOCTOR", "EMPLOYEE"] as const;
export type Role = (typeof ALL_ROLES)[number];
