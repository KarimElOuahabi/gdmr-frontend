import { useState } from "react";
import {
  useListVisitsQuery,
  useSubmitVisitReportMutation,
} from "@/features/visit/visitApi";
import { useGetDoctorProfileQuery } from "@/features/doctor/doctorApi";
import { VisitCard } from "@/components/common/VisitCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { ClipboardCheck, FolderOpen, PlayCircle } from "lucide-react";
import type { VisitResponse } from "@/features/visit/visitApi";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientRecordDialog } from "@/components/common/PatientRecordDialog";

export function VisitsInProgressPage() {
  const { data: profile } = useGetDoctorProfileQuery();
  const { data: inProgress, isLoading } = useListVisitsQuery(
    { doctorId: profile?.id, status: "IN_PROGRESS", page: 0, size: 20 },
    { skip: !profile },
  );

  const [submitReport, { isLoading: isSubmittingReport }] =
    useSubmitVisitReportMutation();

  const [visitToComplete, setVisitToComplete] = useState<VisitResponse | null>(
    null,
  );
  const [reportNotes, setReportNotes] = useState("");
  const [visitForDocuments, setVisitForDocuments] =
    useState<VisitResponse | null>(null);

  const handleCompleteVisit = async () => {
    if (!visitToComplete || !reportNotes.trim()) return;
    try {
      await submitReport({
        id: visitToComplete.id,
        reportNotes: reportNotes.trim(),
      }).unwrap();
      toast.add({
        title: "Visit completed",
        description: "The report has been saved.",
      });
      setVisitToComplete(null);
      setReportNotes("");
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to submit the report.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Visits In Progress</h1>
        <p className="text-muted-foreground">
          Consultations currently underway.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : inProgress?.content.length === 0 ? (
        <EmptyState
          icon={PlayCircle}
          title="No visits in progress"
          description="Consultations you start will show up here while they're underway."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {inProgress?.content.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              perspective="staff"
              footer={
                <>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                    onClick={() => setVisitToComplete(visit)}
                  >
                    <ClipboardCheck className="size-4" />
                    Complete visit
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

      <Dialog
        open={!!visitToComplete}
        onOpenChange={(open) => {
          if (!open) {
            setVisitToComplete(null);
            setReportNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete this visit</DialogTitle>
            <DialogDescription>
              Add your report notes to mark this visit as completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="report-notes">Report notes</Label>
            <Textarea
              id="report-notes"
              placeholder="Summarize the consultation, diagnosis, and any follow-up needed."
              className="min-h-32 resize-none"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleCompleteVisit}
              disabled={isSubmittingReport || !reportNotes.trim()}
            >
              {isSubmittingReport ? "Saving..." : "Complete visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PatientRecordDialog
        visit={visitForDocuments}
        onClose={() => setVisitForDocuments(null)}
      />
    </div>
  );
}
