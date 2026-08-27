import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck2, ClipboardCheck, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentCalendar } from "@/components/common/AppointmentCalendar";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { useGetDoctorProfileQuery } from "@/features/doctor/doctorApi";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isToday(value: string) {
  const d = new Date(value);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisMonth(value: string) {
  const d = new Date(value);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { data: profile } = useGetDoctorProfileQuery();
  const { data: visitsData, isLoading: isLoadingVisits } = useListVisitsQuery(
    { doctorId: profile?.id, page: 0, size: 100 },
    { skip: !profile },
  );

  const visits = useMemo(() => visitsData?.content ?? [], [visitsData]);

  const todaysAppointments = visits.filter(
    (v) => v.confirmedDateTime && isToday(v.confirmedDateTime),
  ).length;

  const awaitingConfirmation = visits.filter(
    (v) => v.status === "AWAITING_DOCTOR_CONFIRMATION",
  ).length;

  const completedThisMonth = visits.filter(
    (v) =>
      v.status === "COMPLETED" &&
      v.confirmedDateTime &&
      isThisMonth(v.confirmedDateTime),
  ).length;

  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}
            {profile ? `, Dr. ${profile.lastName}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your medical visits.
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/doctor/upcoming-visits")}>
          Go to my schedule
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarCheck2}
          label="Today's appointments"
          value={String(todaysAppointments)}
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/doctor/upcoming-visits")}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Awaiting your confirmation"
          value={String(awaitingConfirmation)}
          hint={awaitingConfirmation > 0 ? "Review these in Visit Requests" : undefined}
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/doctor/visit-requests")}
        />
        <StatCard
          icon={BadgeCheck}
          label="Completed this month"
          value={String(completedThisMonth)}
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/doctor/completed-visits")}
        />
      </div>

      <AppointmentCalendar
        visits={visits}
        isLoading={isLoadingVisits}
        perspective="staff"
        title="My Calendar"
      />
    </div>
  );
}
