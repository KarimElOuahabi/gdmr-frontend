import { useState } from "react";
import { useParams } from "react-router-dom";
import { useListVisitsQuery, type VisitResponse } from "@/features/visit/visitApi";
import { useGetEmployeeProfileByIdQuery } from "@/features/employee-management/employeeManagementApi";
import { VisitCard } from "@/components/common/VisitCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, History } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientRecordDialog } from "@/components/common/PatientRecordDialog";

// Full visit history between the logged-in doctor and one patient — every
// status, not just completed. The backend already scopes GET /api/visits to
// the caller's own doctorId, so this can never show the patient's visits
// with other doctors — the doctor is always the viewer themselves, so their
// name is deliberately left off each card.
export function PatientHistoryPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { data: employeeProfile } = useGetEmployeeProfileByIdQuery(
    Number(employeeId),
  );
  const { data: visits, isLoading } = useListVisitsQuery({
    employeeId: Number(employeeId),
    page: 0,
    size: 50,
  });

  const [visitForDocuments, setVisitForDocuments] =
    useState<VisitResponse | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {employeeProfile
            ? `${employeeProfile.firstName} ${employeeProfile.lastName} — Medical History`
            : "Medical History"}
        </h1>
        <p className="text-muted-foreground">
          Your full visit history with this patient.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !visits || visits.content.length === 0 ? (
        <EmptyState
          icon={History}
          title="No visits on record"
          description="You have no visit history with this patient yet."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visits.content.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              perspective="employee"
              hideDoctorInfo
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
                  Documents
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
