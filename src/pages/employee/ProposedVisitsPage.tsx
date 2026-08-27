import { useState } from "react";
import {
  useListVisitsQuery,
  useConfirmVisitMutation,
  useRejectVisitByEmployeeMutation,
} from "@/features/visit/visitApi";
import { VisitCard } from "@/components/common/VisitCard";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { CheckCircle2, CalendarClock } from "lucide-react";
import type { VisitResponse } from "@/features/visit/visitApi";

export function ProposedVisits() {
  const { data, isLoading } = useListVisitsQuery({ page: 0, size: 50 });
  const [confirmVisit, { isLoading: isConfirming }] =
    useConfirmVisitMutation();
  const [rejectVisit, { isLoading: isRejecting }] =
    useRejectVisitByEmployeeMutation();
  const [visitToConfirm, setVisitToConfirm] = useState<VisitResponse | null>(
    null,
  );
  const [visitToReject, setVisitToReject] = useState<VisitResponse | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [suggestedDateTime, setSuggestedDateTime] = useState("");

  const proposedVisits =
    data?.content.filter((v) => v.status === "PROPOSED") ?? [];

  const handleConfirm = async () => {
    if (!visitToConfirm) return;
    try {
      await confirmVisit({ id: visitToConfirm.id }).unwrap();
      toast.add({
        title: "Visit confirmed",
        description: "HR and your doctor have been notified.",
      });
      setVisitToConfirm(null);
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to confirm the visit.",
      });
    }
  };

  const handleReject = async () => {
    if (!visitToReject || !rejectionReason.trim() || !suggestedDateTime) return;
    try {
      await rejectVisit({
        id: visitToReject.id,
        reason: rejectionReason.trim(),
        suggestedDateTime: `${suggestedDateTime}:00`,
      }).unwrap();
      toast.add({
        title: "Suggestion sent",
        description: "HR will see your suggested alternative time.",
      });
      setVisitToReject(null);
      setRejectionReason("");
      setSuggestedDateTime("");
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to send your suggestion.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Proposed Visits</h1>
        <p className="text-muted-foreground">
          Visits waiting for your confirmation.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : proposedVisits.length === 0 ? (
          <p className="text-muted-foreground">
            No proposed visits at the moment.
          </p>
        ) : (
          proposedVisits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              badge={
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  Action Required
                </Badge>
              }
              footerNote="Confirming will lock the slot and alert HR."
              footer={
                <>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all sm:w-auto"
                    onClick={() => setVisitToConfirm(visit)}
                  >
                    <CheckCircle2 className="size-4" />
                    Confirm Visit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setVisitToReject(visit)}
                  >
                    <CalendarClock className="size-4" />
                    Suggest another time
                  </Button>
                </>
              }
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!visitToConfirm}
        onOpenChange={(open) => !open && setVisitToConfirm(null)}
        title="Confirm this visit?"
        description="This will lock in the slot proposed by your doctor and notify HR. This action cannot be undone from here."
        confirmLabel="Confirm Visit"
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
      />

      <Dialog
        open={!!visitToReject}
        onOpenChange={(open) => {
          if (!open) {
            setVisitToReject(null);
            setRejectionReason("");
            setSuggestedDateTime("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest another time</DialogTitle>
            <DialogDescription>
              This sends the visit back to HR with your reason and a time
              that works better for you. Both are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="employee-rejection-reason">Reason</Label>
            <Textarea
              id="employee-rejection-reason"
              placeholder="e.g. I have a work commitment at that time."
              className="min-h-24 resize-none"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-suggested-date-time">
              Suggest a time that works
            </Label>
            <Input
              id="employee-suggested-date-time"
              type="datetime-local"
              value={suggestedDateTime}
              onChange={(e) => setSuggestedDateTime(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleReject}
              disabled={
                isRejecting || !rejectionReason.trim() || !suggestedDateTime
              }
            >
              {isRejecting ? "Sending..." : "Send suggestion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
