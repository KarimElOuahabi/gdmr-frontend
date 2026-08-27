import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { SlotPicker } from "@/features/visit/SlotPicker";
import {
  useAssignTimeSlotMutation,
  useListNegotiationHistoryQuery,
} from "@/features/visit/visitApi";
import type { VisitResponse } from "@/features/visit/visitApi";

interface AssignTimeSlotDialogProps {
  visit: VisitResponse | null;
  onOpenChange: (open: boolean) => void;
}

export function AssignTimeSlotDialog({
  visit,
  onOpenChange,
}: AssignTimeSlotDialogProps) {
  const [assignTimeSlot, { isLoading: isAssigning }] =
    useAssignTimeSlotMutation();
  const { data: negotiationHistory } = useListNegotiationHistoryQuery(
    { visitId: visit?.id ?? 0 },
    { skip: !visit },
  );

  const handleSlotReady = async (timeSlotId: number) => {
    if (!visit) return;
    try {
      await assignTimeSlot({ id: visit.id, timeSlotId }).unwrap();
      toast.add({
        title: "Slot assigned",
        description: "The employee can now confirm this appointment.",
      });
      onOpenChange(false);
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to assign the time slot.",
      });
    }
  };

  return (
    <Dialog open={!!visit} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a time slot</DialogTitle>
          <DialogDescription>
            Pick one of the doctor&apos;s available slots, or create a new
            one.
          </DialogDescription>
        </DialogHeader>

        {visit && (
          <SlotPicker
            doctorId={visit.doctorId}
            defaultVisitType={visit.visitType}
            lockVisitType
            suggestedSlots={visit.proposedSlotsByEmployee}
            negotiationHistory={negotiationHistory}
            onSlotReady={handleSlotReady}
            isSubmitting={isAssigning}
            submitLabel="Assign this slot"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
