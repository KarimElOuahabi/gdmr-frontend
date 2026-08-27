import { useState } from "react";
import {
  useListVisitsQuery,
  useUpdateVisitStatusMutation,
} from "@/features/visit/visitApi";
import { useGetDoctorProfileQuery } from "@/features/doctor/doctorApi";
import { VisitCard } from "@/components/common/VisitCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, UserX, FolderOpen, CalendarCheck } from "lucide-react";
import type { VisitResponse } from "@/features/visit/visitApi";
import { toast } from "@/components/ui/toast";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientRecordDialog } from "@/components/common/PatientRecordDialog";

export function UpcomingVisitsPage() {
  const { data: profile } = useGetDoctorProfileQuery();
  const { data: scheduled, isLoading } = useListVisitsQuery(
    { doctorId: profile?.id, status: "SCHEDULED", page: 0, size: 20 },
    { skip: !profile },
  );

  const [updateStatus] = useUpdateVisitStatusMutation();
  const [visitForDocuments, setVisitForDocuments] =
    useState<VisitResponse | null>(null);

  const handleUpdateStatus = async (
    id: number,
    status: "IN_PROGRESS" | "ABSENT",
  ) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.add({
        title: status === "IN_PROGRESS" ? "Consultation started" : "Marked absent",
        description:
          status === "IN_PROGRESS"
            ? "The visit is now in progress."
            : "The employee has been marked as absent for this visit.",
      });
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update the visit status.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Upcoming Visits</h1>
        <p className="text-muted-foreground">
          Confirmed visits on your schedule.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : scheduled?.content.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No confirmed visits right now"
          description="Visits you confirm will land here, ready for their scheduled date."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {scheduled?.content.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              perspective="staff"
              footer={
                <>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                    onClick={() => handleUpdateStatus(visit.id, "IN_PROGRESS")}
                  >
                    <PlayCircle className="size-4" />
                    Start consultation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => handleUpdateStatus(visit.id, "ABSENT")}
                  >
                    <UserX className="size-4" />
                    Mark absent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setVisitForDocuments(visit)}
                  >
                    <FolderOpen className="size-4" />
                    Patient record
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <PatientRecordDialog
        visit={visitForDocuments}
        onClose={() => setVisitForDocuments(null)}
      />
    </div>
  );
}
