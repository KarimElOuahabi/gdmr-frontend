import { useNavigate } from "react-router-dom";
import { CalendarClock, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
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

function formatDateTime(value: string | null) {
  if (!value) return "Pending";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface EmployeeVisitHistoryCardProps {
  /** The Employee entity id (visits are keyed by this, not the user id). */
  employeeId: number;
}

// Full cross-doctor visit history for an employee — HR/Admin only. Doctors
// never see this (their own visit list is server-scoped to just their own
// patients), and it deliberately shows no medical report notes: the backend
// returns the administrative view for HR/ADMIN callers.
export function EmployeeVisitHistoryCard({
  employeeId,
}: EmployeeVisitHistoryCardProps) {
  const navigate = useNavigate();
  const { data: visitsData, isLoading } = useListVisitsQuery({
    employeeId,
    page: 0,
    size: 50,
  });
  const { data: doctorsData } = useListDoctorsQuery({ page: 0, size: 100 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Visit history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !visitsData || visitsData.content.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No visits on record for this employee yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {visitsData.content.map((visit) => {
              const doctor = doctorsData?.content.find(
                (d) => d.id === visit.doctorId,
              );
              return (
                <li key={visit.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/visits/${visit.id}`)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left text-sm transition-colors hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : `#${visit.doctorId}`}
                      {doctor?.specialty && (
                        <span className="font-normal text-muted-foreground">
                          — {doctor.specialty}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        {formatDateTime(visit.confirmedDateTime)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`border-transparent ${STATUS_BADGE_CLASSES[visit.status]}`}
                      >
                        {visit.status.replace(/_/g, " ")}
                      </Badge>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
