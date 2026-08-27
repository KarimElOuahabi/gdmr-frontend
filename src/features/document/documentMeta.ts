import {
  Stethoscope,
  BadgeCheck,
  Pill,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { DocumentType } from "@/features/document/documentApi";

interface DocumentMeta {
  icon: LucideIcon;
  className: string;
  label: string;
  description: string;
}

export const DOCUMENT_META: Record<DocumentType, DocumentMeta> = {
  EXAMINATION_REPORT: {
    icon: Stethoscope,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    label: "Examination Report",
    description: "Written up by the doctor after a consultation.",
  },
  MEDICAL_CERTIFICATE: {
    icon: BadgeCheck,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    label: "Medical Certificate",
    description: "Certifies a medical finding or condition.",
  },
  PRESCRIPTION: {
    icon: Pill,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Prescription",
    description: "Medication or treatment prescribed by the doctor.",
  },
  FITNESS_CERTIFICATE: {
    icon: ShieldCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Fitness / Recovery Certificate",
    description:
      "A certificate you provide, e.g. from your own doctor after illness.",
  },
};

// Types each role is allowed to upload — mirrors the backend's validateRoleCanUploadType.
export const EMPLOYEE_UPLOADABLE_TYPES: DocumentType[] = ["FITNESS_CERTIFICATE"];
export const DOCTOR_UPLOADABLE_TYPES: DocumentType[] = [
  "EXAMINATION_REPORT",
  "MEDICAL_CERTIFICATE",
  "PRESCRIPTION",
];
