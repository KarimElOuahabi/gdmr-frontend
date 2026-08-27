export const ALL_SPECIALTIES = [
  "OCCUPATIONAL_PHYSICIAN",
  "GENERAL_PRACTITIONER",
  "OPHTHALMOLOGIST",
  "DENTIST",
  "PSYCHOLOGIST",
  "ERGONOMIST",
  "OTHER",
] as const;

export type Specialty = (typeof ALL_SPECIALTIES)[number];
