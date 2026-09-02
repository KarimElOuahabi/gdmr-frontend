import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { ALL_VISIT_STATUSES } from "@/types/visit";
import { VisitCard } from "@/components/common/VisitCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { CalendarClock } from "lucide-react";

export function Appointments() {
  const { data, isLoading } = useListVisitsQuery({ page: 0, size: 50 });
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const historyVisits =
    data?.content.filter((v) => v.status !== "PROPOSED") ?? [];

  const availableStatuses = ALL_VISIT_STATUSES.filter(
    (status) => status !== "PROPOSED",
  );

  const filteredVisits =
    statusFilter === "ALL"
      ? historyVisits
      : historyVisits.filter((v) => v.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">
            View your upcoming schedule and past visits.
          </p>
        </div>

        {/* Status Dropdown Filter */}
        {historyVisits.length > 0 && (
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "ALL")}
          >
            {" "}
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : filteredVisits.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No visits found"
            description="No visits match this status filter."
          />
        ) : (
          filteredVisits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))
        )}
      </div>
    </div>
  );
}
