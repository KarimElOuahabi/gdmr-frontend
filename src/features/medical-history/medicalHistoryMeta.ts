import {
  AlertTriangle,
  HeartPulse,
  Scissors,
  Syringe,
  Users,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { MedicalHistoryCategory } from "@/features/medical-history/medicalHistoryApi";

interface MedicalHistoryCategoryMeta {
  icon: LucideIcon;
  className: string;
  label: string;
}

export const MEDICAL_HISTORY_CATEGORY_META: Record<
  MedicalHistoryCategory,
  MedicalHistoryCategoryMeta
> = {
  ALLERGY: {
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Allergy",
  },
  CHRONIC_CONDITION: {
    icon: HeartPulse,
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Chronic Condition",
  },
  SURGERY: {
    icon: Scissors,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    label: "Surgery",
  },
  VACCINATION: {
    icon: Syringe,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Vaccination",
  },
  FAMILY_HISTORY: {
    icon: Users,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    label: "Family History",
  },
  OTHER: {
    icon: FileText,
    className: "bg-muted text-muted-foreground",
    label: "Other",
  },
};

export const ALL_MEDICAL_HISTORY_CATEGORIES: MedicalHistoryCategory[] = [
  "ALLERGY",
  "CHRONIC_CONDITION",
  "SURGERY",
  "VACCINATION",
  "FAMILY_HISTORY",
  "OTHER",
];
