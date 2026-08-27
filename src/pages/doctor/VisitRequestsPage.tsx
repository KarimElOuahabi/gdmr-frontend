import { useState } from "react";
import {
  useListVisitsQuery,
  useConfirmVisitByDoctorMutation,
  useRejectVisitByDoctorMutation,
} from "@/features/visit/visitApi";
import { useGetDoctorProfileQuery } from "@/features/doctor/doctorApi";
import { VisitCard } from "@/components/common/VisitCard";
import { Button } from "@/components/ui/button";
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
import { Check, X, Inbox } from "lucide-react";
import type { VisitResponse } from "@/features/visit/visitApi";
import { EmptyState } from "@/components/common/EmptyState";

export function VisitRequestsPage() {
  const { data: profile } = useGetDoctorProfileQuery();
  const { data: awaitingConfirmation, isLoading } = useListVisitsQuery(
    { doctorId: profile?.id, status: "AWAITING_DOCTOR_CONFIRMATION", page: 0, size: 20 },
    { skip: !profile },
  );

  const [confirmByDoctor, { isLoading: isConfirming }] =
    useConfirmVisitByDoctorMutation();
  const [rejectByDoctor, { isLoading: isRejecting }] =
    useRejectVisitByDoctorMutation();

  const [visitToReject, setVisitToReject] = useState<VisitResponse | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [suggestedDateTime, setSuggestedDateTime] = useState("");

  const handleConfirm = async (visit: VisitResponse) => {
    try {
      await confirmByDoctor({ id: visit.id }).unwrap();
      toast.add({
        title: "Visit confirmed",
        description: "It's now on your schedule.",
      });
    } catch {
      toast.add({ title: "Error", description: "Failed to confirm the visit." });
    }
  };

  const handleReject = async () => {
    if (!visitToReject || !rejectionReason.trim() || !suggestedDateTime) return;
    try {
      await rejectByDoctor({
        id: visitToReject.id,
        reason: rejectionReason.trim(),
        suggestedDateTime: `${suggestedDateTime}:00`,
      }).unwrap();
      toast.add({
        title: "Visit rejected",
        description: "HR will see your suggested alternative time.",
      });
      setVisitToReject(null);
      setRejectionReason("");
      setSuggestedDateTime("");
    } catch {
      toast.add({ title: "Error", description: "Failed to reject the visit." });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Visit Requests</h1>
        <p className="text-muted-foreground">
          Visits awaiting your confirmation.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : awaitingConfirmation?.content.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing to confirm right now"
          description="Visit requests waiting on your confirmation will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {awaitingConfirmation?.content.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              perspective="staff"
              footer={
                <>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                    disabled={isConfirming}
                    onClick={() => handleConfirm(visit)}
                  >
                    <Check className="size-4" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    disabled={isRejecting}
                    onClick={() => setVisitToReject(visit)}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

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
            <DialogTitle>Reject this visit</DialogTitle>
            <DialogDescription>
              This frees up the assigned slot and sends the visit back to HR
              to pick a different time. A reason and an alternative time you
              propose are both required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g. I'm off that day, or I already have another appointment at that time."
              className="min-h-24 resize-none"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggested-date-time">Suggest a time that works</Label>
            <Input
              id="suggested-date-time"
              type="datetime-local"
              value={suggestedDateTime}
              onChange={(e) => setSuggestedDateTime(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                isRejecting || !rejectionReason.trim() || !suggestedDateTime
              }
            >
              {isRejecting ? "Rejecting..." : "Reject visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
