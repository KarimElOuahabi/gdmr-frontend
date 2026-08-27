import { useState } from "react";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { useGetDoctorProfileQuery } from "@/features/doctor/doctorApi";
import { VisitCard } from "@/components/common/VisitCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, BadgeCheck } from "lucide-react";
import type { VisitResponse } from "@/features/visit/visitApi";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientRecordDialog } from "@/components/common/PatientRecordDialog";

export function CompletedVisitsPage() {
  const { data: profile } = useGetDoctorProfileQuery();
  const { data: completed, isLoading } = useListVisitsQuery(
    { doctorId: profile?.id, status: "COMPLETED", page: 0, size: 50 },
    { skip: !profile },
  );

  const [visitForDocuments, setVisitForDocuments] =
    useState<VisitResponse | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Completed Visits</h1>
        <p className="text-muted-foreground">
          Your consultation history and reports.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : completed?.content.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="No completed visits yet"
          description="Your consultation history and reports will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {completed?.content.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              perspective="staff"
              extraRows={[
                { label: "Report notes", value: visit.reportNotes || "—" },
              ]}
              footer={
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => setVisitForDocuments(visit)}
                >
                  <FolderOpen className="size-4" />
                  Patient record
                </Button>
              }
            />
          ))}
        </div>
      )}

      <PatientRecordDialog
        visit={visitForDocuments}
        onClose={() => setVisitForDocuments(null)}
        documentDescription="Reports, certificates, and prescriptions for this employee. You can delete a wrongly-uploaded document and upload the correct one in its place."
      />
    </div>
  );
}
