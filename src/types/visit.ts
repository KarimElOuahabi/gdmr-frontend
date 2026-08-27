export const ALL_VISIT_STATUSES = [
  "REQUESTED",
  "PROPOSED",
  "AWAITING_DOCTOR_CONFIRMATION",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "ABSENT",
] as const;
export type VisitStatus = (typeof ALL_VISIT_STATUSES)[number];

export const ALL_VISIT_TYPES = [
  "SPONTANEOUS",
  "PRE_EMPLOYMENT",
  "ANNUAL",
  "RETURN_AFTER_ILLNESS",
  "RETURN_AFTER_MATERNITY",
  "WORK_ACCIDENT",
] as const;
export type VisitType = (typeof ALL_VISIT_TYPES)[number];
