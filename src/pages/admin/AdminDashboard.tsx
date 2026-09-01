import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Briefcase,
  ShieldCheck,
  Inbox,
  ClipboardCheck,
  PlayCircle,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentCalendar } from "@/components/common/AppointmentCalendar";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useGetRolesStatsQuery } from "@/features/admin/adminRolesApi";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import type { Role } from "@/types/role";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const ROLE_CARD_META: Record<
  Role,
  { label: string; icon: LucideIcon; className: string; path: string }
> = {
  EMPLOYEE: {
    label: "Employees",
    icon: Users,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    path: "/employees",
  },
  DOCTOR: {
    label: "Doctors",
    icon: Stethoscope,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    path: "/doctors",
  },
  HR: {
    label: "HR staff",
    icon: Briefcase,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    path: "/hrs",
  },
  ADMIN: {
    label: "Admins",
    icon: ShieldCheck,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    path: "/admins",
  },
};

const ROLE_ORDER: Role[] = ["EMPLOYEE", "DOCTOR", "HR", "ADMIN"];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: me } = useGetCurrentUserQuery();
  const { data: rolesStats, isLoading: isLoadingRoles } =
    useGetRolesStatsQuery();

  // Pulled unfiltered (large page) so every count below is a consistent
  // snapshot of the same dataset rather than four separate status queries.
  const { data: visitsData, isLoading: isLoadingVisits } = useListVisitsQuery(
    { page: 0, size: 200 },
  );
  const visits = useMemo(() => visitsData?.content ?? [], [visitsData]);

  const openRequests = visits.filter((v) => v.status === "REQUESTED").length;
  const awaitingDoctor = visits.filter(
    (v) => v.status === "AWAITING_DOCTOR_CONFIRMATION",
  ).length;
  const inProgress = visits.filter((v) => v.status === "IN_PROGRESS").length;
  const noShows = visits.filter((v) => v.status === "ABSENT").length;

  const statsByRole = new Map(rolesStats?.map((s) => [s.role, s]));
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
            A system-wide look at people and medical visits.
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
          <Button className="gap-2" onClick={() => navigate("/users")}>
            Manage users
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_ORDER.map((role) => {
          const meta = ROLE_CARD_META[role];
          const stat = statsByRole.get(role);
          return (
            <StatCard
              key={role}
              icon={meta.icon}
              label={meta.label}
              value={stat ? String(stat.totalUsers) : "0"}
              hint={
                stat
                  ? `${stat.activeUsers} active${
                      stat.inactiveUsers > 0
                        ? `, ${stat.inactiveUsers} inactive`
                        : ""
                    }`
                  : undefined
              }
              className={meta.className}
              isLoading={isLoadingRoles}
              onClick={() => navigate(meta.path)}
            />
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Open requests"
          value={String(openRequests)}
          hint={openRequests > 0 ? "Waiting on a doctor slot" : "All caught up"}
          className="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/visits?status=REQUESTED")}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Awaiting doctor confirmation"
          value={String(awaitingDoctor)}
          className="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/visits?status=AWAITING_DOCTOR_CONFIRMATION")}
        />
        <StatCard
          icon={PlayCircle}
          label="In progress now"
          value={String(inProgress)}
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/visits?status=IN_PROGRESS")}
        />
        <StatCard
          icon={UserX}
          label="No-shows on file"
          value={String(noShows)}
          hint={noShows > 0 ? "May need employee follow-up" : undefined}
          className="bg-red-500/10 text-red-600 dark:text-red-400"
          isLoading={isLoadingVisits}
          onClick={() => navigate("/visits?status=ABSENT")}
        />
      </div>

      <AppointmentCalendar
        visits={visits}
        isLoading={isLoadingVisits}
        perspective="staff"
        title="All Visits"
        onVisitClick={(visit) => navigate(`/visits/${visit.id}`)}
      />
    </div>
  );
}
