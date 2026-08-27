import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Inbox, ClipboardCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentCalendar } from "@/components/common/AppointmentCalendar";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useListVisitsQuery } from "@/features/visit/visitApi";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HrDashboard() {
  const navigate = useNavigate();
  const { data: me } = useGetCurrentUserQuery();

  // Pulled unfiltered (large page) so the three counts below are consistent
  // snapshots of the same dataset rather than three separate status queries.
  const { data: visitsData, isLoading } = useListVisitsQuery({
    page: 0,
    size: 200,
  });
  const visits = useMemo(() => visitsData?.content ?? [], [visitsData]);

  const unassignedRequests = visits.filter((v) => v.status === "REQUESTED").length;
  const awaitingDoctor = visits.filter(
    (v) => v.status === "AWAITING_DOCTOR_CONFIRMATION",
  ).length;
  // Matches exactly what /visits?status=ABSENT shows — that page has no date
  // filtering, so a "this month" count here would silently disagree with it.
  const noShows = visits.filter((v) => v.status === "ABSENT").length;

  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}
            {me ? `, ${me.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Here's what needs your attention across medical visits.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/visits")}
          >
            All visits
          </Button>
          <Button className="gap-2" onClick={() => navigate("/hr/create-visit")}>
            <CalendarPlus className="size-4" />
            Schedule a visit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Inbox}
          label="Unassigned requests"
          value={String(unassignedRequests)}
          hint={
            unassignedRequests > 0 ? "Waiting on a doctor slot" : "All caught up"
          }
          className="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          isLoading={isLoading}
          onClick={() => navigate("/hr/visit-requests")}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Awaiting doctor confirmation"
          value={String(awaitingDoctor)}
          hint={awaitingDoctor > 0 ? "Stuck in the doctor's queue" : undefined}
          className="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          isLoading={isLoading}
          onClick={() => navigate("/visits?status=AWAITING_DOCTOR_CONFIRMATION")}
        />
        <StatCard
          icon={UserX}
          label="No-shows on file"
          value={String(noShows)}
          hint={noShows > 0 ? "May need employee follow-up" : undefined}
          className="bg-red-500/10 text-red-600 dark:text-red-400"
          isLoading={isLoading}
          onClick={() => navigate("/visits?status=ABSENT")}
        />
      </div>

      <AppointmentCalendar
        visits={visits}
        isLoading={isLoading}
        perspective="staff"
        title="All Visits"
      />
    </div>
  );
}
