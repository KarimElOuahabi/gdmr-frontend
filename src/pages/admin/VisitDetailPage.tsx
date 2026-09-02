import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ConnectorLine } from "@/components/common/ConnectorLine";
import { SeparatorList } from "@/components/common/separator-list";
import { useGetVisitQuery } from "@/features/visit/visitApi";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import { useListEmployeesQuery } from "@/features/employee-management/employeeManagementApi";
import type { VisitStatus } from "@/types/visit";

const STATUS_BADGE_CLASSES: Record<VisitStatus, string> = {
  REQUESTED: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  PROPOSED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  AWAITING_DOCTOR_CONFIRMATION:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
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

export function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const id = Number(visitId);

  const { data: visit, isLoading: isVisitLoading } = useGetVisitQuery(id, {
    skip: !id,
  });
  const { data: doctorsData, isLoading: isDoctorsLoading } =
    useListDoctorsQuery({ page: 0, size: 100 });
  const { data: employeesData, isLoading: isEmployeesLoading } =
    useListEmployeesQuery({ page: 0, size: 100 });

  const doctor = doctorsData?.content.find((d) => d.id === visit?.doctorId);
  const employee = employeesData?.content.find(
    (e) => e.employeeId === visit?.employeeId,
  );

  const isLoading =
    isVisitLoading || isDoctorsLoading || isEmployeesLoading || !visit;

  // A notification click can deep-link here with ?highlight=<visitId> — glow
  // once then fade, matching VisitCard's behavior on list pages.
  const [searchParams, setSearchParams] = useSearchParams();
  const isHighlighted = searchParams.get("highlight") === String(id);
  const [glow, setGlow] = useState(isHighlighted);

  useEffect(() => {
    if (!isHighlighted) return;
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

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <Card
            className={`mx-auto w-full max-w-3xl overflow-hidden shadow-lg transition-all duration-700 ${
              glow
                ? "scale-[1.01] ring-2 ring-primary shadow-lg shadow-primary/30"
                : ""
            }`}
          >
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-xl">Visit #{visit.id}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4 p-4 sm:gap-16 sm:p-8">
              <div className="flex min-w-0 flex-col items-center gap-2">
                <UserAvatar
                  userId={employee?.id}
                  role="EMPLOYEE"
                  firstName={employee?.firstName ?? ""}
                  lastName={employee?.lastName ?? ""}
                  className="h-16 w-16 sm:h-28 sm:w-28"
                  iconClassName="h-6 w-6 sm:h-10 sm:w-10"
                />
                <span className="max-w-24 truncate text-sm font-medium sm:max-w-none">
                  {employee
                    ? `${employee.firstName} ${employee.lastName}`
                    : `Employee #${visit.employeeId}`}
                </span>
                <span className="max-w-24 truncate text-xs text-muted-foreground sm:max-w-none">
                  {employee?.department ?? "Employee"}
                </span>
              </div>

              <ConnectorLine />

              <div className="flex min-w-0 flex-col items-center gap-2">
                <UserAvatar
                  userId={doctor?.userId}
                  role="DOCTOR"
                  firstName={doctor?.firstName ?? ""}
                  lastName={doctor?.lastName ?? ""}
                  className="h-16 w-16 sm:h-28 sm:w-28"
                  iconClassName="h-6 w-6 sm:h-10 sm:w-10"
                />
                <span className="max-w-24 truncate text-sm font-medium sm:max-w-none">
                  {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : `Doctor #${visit.doctorId}`}
                </span>
                <span className="max-w-24 truncate text-xs text-muted-foreground sm:max-w-none">
                  {doctor?.specialty ?? "Doctor"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="mx-auto w-full max-w-3xl">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Visit details</CardTitle>
                <Badge
                  variant="outline"
                  className={STATUS_BADGE_CLASSES[visit.status]}
                >
                  {formatStatusLabel(visit.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SeparatorList
                items={[
                  { label: "Type", value: visit.visitType },
                  {
                    label: "Date",
                    value: visit.confirmedDateTime ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-transparent bg-emerald-500/10 font-normal text-emerald-600 dark:text-emerald-400"
                      >
                        <CalendarClock className="size-3" />
                        {formatDateTime(visit.confirmedDateTime)}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-transparent bg-muted font-normal text-muted-foreground"
                      >
                        <CalendarClock className="size-3" />
                        Pending
                      </Badge>
                    ),
                  },
                  { label: "Reason", value: visit.motif || "—" },
                  ...(visit.reportNotes
                    ? [{ label: "Report notes", value: visit.reportNotes }]
                    : []),
                  ...(!visit.confirmedDateTime &&
                  visit.proposedSlotsByEmployee.length > 0
                    ? [
                        {
                          label:
                            visit.proposedSlotsByEmployee.length > 1
                              ? "Suggested slots"
                              : "Suggested slot",
                          value: (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {visit.proposedSlotsByEmployee.map((slot) => (
                                <Badge
                                  key={slot}
                                  variant="outline"
                                  className="gap-1 border-transparent bg-sky-500/10 font-normal text-sky-600 dark:text-sky-400"
                                >
                                  <CalendarClock className="size-3" />
                                  {formatDateTime(slot)}
                                </Badge>
                              ))}
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
