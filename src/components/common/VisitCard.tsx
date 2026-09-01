import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeparatorList } from "@/components/common/separator-list";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import { useListEmployeesQuery } from "@/features/employee-management/employeeManagementApi";
import type { VisitResponse } from "@/features/visit/visitApi";
import type { VisitStatus } from "@/types/visit";

const STATUS_BADGE_CLASSES: Record<VisitStatus, string> = {
  REQUESTED: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  PROPOSED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  AWAITING_DOCTOR_CONFIRMATION: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  SCHEDULED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ABSENT: "bg-destructive/10 text-destructive",
};

function formatStatusLabel(status: VisitStatus) {
  return status.replace(/_/g, " ");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface VisitCardProps {
  visit: VisitResponse;
  /** "employee" shows the doctor's info; "staff" (HR/doctor) shows both employee & doctor info. */
  perspective?: "employee" | "staff";
  /** Overrides the default status badge shown top-right. */
  badge?: ReactNode;
  /** Extra rows appended after the standard ones (e.g. report notes). */
  extraRows?: { label: string; value: ReactNode }[];
  /** Action buttons rendered in the card footer. Omit to render no footer. */
  footer?: ReactNode;
  /** Small helper text shown next to the footer actions. */
  footerNote?: string;
  /** When provided, the whole card becomes clickable (e.g. to open visit details). */
  onClick?: (visit: VisitResponse) => void;
}

export function VisitCard({
  visit,
  perspective = "employee",
  badge,
  extraRows = [],
  footer,
  footerNote,
  onClick,
}: VisitCardProps) {
  const { data: doctorsData, isLoading: isDoctorLoading } = useListDoctorsQuery(
    { page: 0, size: 100 },
  );
  const { data: employeesData, isLoading: isEmployeeLoading } =
    useListEmployeesQuery(
      { page: 0, size: 100 },
      { skip: perspective !== "staff" },
    );

  // A notification click can deep-link here with ?highlight=<visitId> — glow and
  // scroll to the matching card once, then fade it so it doesn't linger forever.
  const [searchParams, setSearchParams] = useSearchParams();
  const isHighlighted = searchParams.get("highlight") === String(visit.id);
  const [glow, setGlow] = useState(isHighlighted);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHighlighted) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(() => {
      setGlow(false);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("highlight");
          return next;
        },
        { replace: true },
      );
    }, 2500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHighlighted]);

  const doctor = doctorsData?.content.find((d) => d.id === visit.doctorId);
  const employee = employeesData?.content.find(
    (e) => e.employeeId === visit.employeeId,
  );

  const rows: { label: string; value: ReactNode }[] = [];

  if (perspective === "staff") {
    rows.push({
      label: "Employee",
      value: isEmployeeLoading
        ? "Loading..."
        : employee
          ? `${employee.firstName} ${employee.lastName}`
          : `#${visit.employeeId}`,
    });
  }

  rows.push({
    label: "Doctor",
    value: isDoctorLoading
      ? "Loading..."
      : `Dr. ${doctor?.lastName ?? visit.doctorId}`,
  });

  if (perspective === "employee") {
    rows.push({
      label: "Specialty",
      value: isDoctorLoading ? "..." : doctor?.specialty || "—",
    });
  }

  rows.push({ label: "Motif", value: visit.motif || "—" });

  rows.push({
    label: "Date",
    value: formatDateTime(visit.confirmedDateTime) ?? "Pending",
  });

  if (!visit.confirmedDateTime && visit.proposedSlotsByEmployee.length > 0) {
    rows.push({
      label: "Suggested slots",
      value: visit.proposedSlotsByEmployee
        .map((slot) => formatDateTime(slot))
        .join(", "),
    });
  }

  rows.push(...extraRows);

  const title =
    perspective === "staff"
      ? `${employee ? `${employee.firstName} ${employee.lastName}` : `Employee #${visit.employeeId}`} — Dr. ${doctor?.lastName ?? visit.doctorId}`
      : `Appointment with Dr. ${doctor?.lastName ?? ""}`;

  return (
    <Card
      ref={cardRef}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? () => onClick(visit) : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(visit);
              }
            }
          : undefined
      }
      className={`overflow-hidden pb-0 transition-all duration-700 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/40"
          : ""
      } ${
        glow
          ? "scale-[1.02] ring-2 ring-primary shadow-lg shadow-primary/30 -translate-y-0.5"
          : ""
      }`}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <CardTitle className="break-words">{title}</CardTitle>
            <CardDescription className="mt-1">
              Visit details for the appointment.
            </CardDescription>
          </div>
          <div className="shrink-0">
          {badge ?? (
            <Badge
              variant="outline"
              className={STATUS_BADGE_CLASSES[visit.status]}
            >
              {formatStatusLabel(visit.status)}
            </Badge>
          )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6 pb-4 sm:flex-row sm:items-center">
        <SeparatorList items={rows} />
      </CardContent>

      {footer && (
        <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/30 px-6 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {footerNote && (
            <p className="text-xs text-muted-foreground">{footerNote}</p>
          )}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            {footer}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
