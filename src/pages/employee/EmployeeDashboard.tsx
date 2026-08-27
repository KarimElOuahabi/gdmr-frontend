import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Stethoscope,
  FolderOpen,
  Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentCalendar } from "@/components/common/AppointmentCalendar";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { useListMyDocumentsQuery } from "@/features/document/documentApi";
import { useGetEmployeeProfileQuery } from "@/features/employee/employeeApi";

const UPCOMING_STATUSES = [
  "PROPOSED",
  "AWAITING_DOCTOR_CONFIRMATION",
  "SCHEDULED",
  "IN_PROGRESS",
] as const;

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const { data: profile } = useGetEmployeeProfileQuery();
  const { data: visitsData, isLoading: isLoadingVisits } = useListVisitsQuery(
    { page: 0, size: 100 },
  );
  const { data: documents } = useListMyDocumentsQuery();

  const visits = useMemo(() => visitsData?.content ?? [], [visitsData]);
  const now = useMemo(() => new Date(), []);

  const nextAppointment = useMemo(() => {
    const nowMs = now.getTime();
    return visits
      .filter(
        (v) =>
          v.confirmedDateTime &&
          UPCOMING_STATUSES.includes(
            v.status as (typeof UPCOMING_STATUSES)[number],
          ) &&
          new Date(v.confirmedDateTime).getTime() >= nowMs,
      )
      .sort(
        (a, b) =>
          new Date(a.confirmedDateTime!).getTime() -
          new Date(b.confirmedDateTime!).getTime(),
      )[0];
  }, [visits, now]);

  const pendingConfirmations = visits.filter(
    (v) => v.status === "PROPOSED",
  ).length;

  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}
            {profile ? `, ${profile.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your medical visits.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/employee/documents")}
          >
            <FolderOpen className="size-4" />
            My documents
          </Button>
          <Button className="gap-2" onClick={() => navigate("/employee/doctors")}>
            <Stethoscope className="size-4" />
            Request a visit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarClock}
          label="Next appointment"
          value={
            nextAppointment
              ? formatDateTime(nextAppointment.confirmedDateTime!)
              : "None scheduled"
          }
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/employee/appointments")}
        />
        <StatCard
          icon={Hourglass}
          label="Awaiting your confirmation"
          value={String(pendingConfirmations)}
          hint={pendingConfirmations > 0 ? "A slot needs your review" : undefined}
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/employee/proposed-visits")}
        />
        <StatCard
          icon={FolderOpen}
          label="Documents on file"
          value={String(documents?.length ?? 0)}
          className="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          onClick={() => navigate("/employee/documents")}
        />
      </div>

      <AppointmentCalendar
        visits={visits}
        isLoading={isLoadingVisits}
        perspective="employee"
        title="My Calendar"
      />
    </div>
  );
}
