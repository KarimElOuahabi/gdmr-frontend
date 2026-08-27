import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Clock, Plus, Send, Paperclip } from "lucide-react";

interface Availability {
  id: number;
  date: string;
  time: string;
}

export interface AppointmentRequestSubmitPayload {
  proposedSlots: string[];
  reason: string;
  attachment: File | null;
}

interface AppointmentRequestFormProps {
  onSubmitRequest?: (
    payload: AppointmentRequestSubmitPayload,
  ) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const MAX_SLOTS = 3;
const MAX_REASON_LENGTH = 300;
const ACCEPTED_ATTACHMENT_TYPES = "application/pdf,image/jpeg,image/png";

const appointmentRequestFormSchema = z.object({
  selectedDate: z.string(),
  selectedTime: z.string(),
  reason: z.string().max(MAX_REASON_LENGTH),
});

type AppointmentRequestFormValues = z.infer<typeof appointmentRequestFormSchema>;

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface AvailabilitySlotRowProps {
  slot: Availability;
  index: number;
  onRemove: (id: number) => void;
}

function AvailabilitySlotRow({
  slot,
  index,
  onRemove,
}: AvailabilitySlotRowProps) {
  return (
    <li className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center gap-4 sm:gap-6">
        <span className="w-24 text-sm font-medium text-muted-foreground">
          Option {index + 1}
        </span>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>{formatDate(slot.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>{formatTime(slot.time)}</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onRemove(slot.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove this time slot</span>
      </Button>
    </li>
  );
}

export function AppointmentRequestForm({
  onSubmitRequest,
  isSubmitting = false,
  submitLabel = "Send Request",
}: AppointmentRequestFormProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const { register, watch, setValue, getValues } =
    useForm<AppointmentRequestFormValues>({
      resolver: zodResolver(appointmentRequestFormSchema),
      defaultValues: {
        selectedDate: "",
        selectedTime: "",
        reason: "",
      },
    });

  const selectedDate = watch("selectedDate");
  const selectedTime = watch("selectedTime");
  const reason = watch("reason");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const atLimit = availabilities.length >= MAX_SLOTS;

  const isDuplicate = availabilities.some(
    (a) => a.date === selectedDate && a.time === selectedTime,
  );

  const canAdd = !!selectedDate && !!selectedTime && !atLimit && !isDuplicate;

  const sortedAvailabilities = useMemo(
    () =>
      [...availabilities].sort((a, b) =>
        `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
      ),
    [availabilities],
  );

  const handleAdd = () => {
    if (!canAdd) return;
    setAvailabilities((prev) => [
      ...prev,
      { id: Date.now(), date: selectedDate, time: selectedTime },
    ]);
    setValue("selectedDate", "");
    setValue("selectedTime", "");
  };

  const handleRemove = (idToRemove: number) => {
    setAvailabilities((prev) => prev.filter((a) => a.id !== idToRemove));
  };

  const handleSend = async () => {
    if (availabilities.length === 0) return;
    setIsSending(true);
    try {
      const proposedSlots = [...availabilities]
        .sort((a, b) =>
          `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
        )
        .map((slot) => `${slot.date}T${slot.time}:00`);
      const payload: AppointmentRequestSubmitPayload = {
        proposedSlots,
        reason: getValues("reason"),
        attachment,
      };

      if (onSubmitRequest) {
        await onSubmitRequest(payload);
        return;
      }

      console.log("Sending proposed availabilities:", proposedSlots);
      console.log("Reason:", payload.reason);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="mx-auto mt-6 w-full max-w-3xl pb-0 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
              1
            </span>
            <Label className="text-sm font-semibold text-foreground">
              Proposed Availability
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Suggest up to {MAX_SLOTS} time slots for your appointment.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 rounded-lg border bg-muted/10 p-4 sm:flex-row">
          <div className="w-full space-y-2 sm:w-auto sm:flex-1">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" min={today} {...register("selectedDate")} />
          </div>

          <div className="w-full space-y-2 sm:w-auto sm:flex-1">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" {...register("selectedTime")} />
          </div>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex w-full items-center gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Slot
          </Button>
        </div>

        {isDuplicate && (
          <p className="text-sm text-destructive">
            You've already added this date and time.
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {availabilities.length} of {MAX_SLOTS} slots added
            </span>
          </div>

          {sortedAvailabilities.length === 0 ? (
            <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
              No availabilities added yet. Please add at least one.
            </div>
          ) : (
            <ul className="space-y-3" aria-live="polite">
              {sortedAvailabilities.map((slot, index) => (
                <AvailabilitySlotRow
                  key={slot.id}
                  slot={slot}
                  index={index}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                2
              </span>
              <Label htmlFor="reason">
                Reason{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {reason.length}/{MAX_REASON_LENGTH}
            </span>
          </div>
          <Textarea
            id="reason"
            placeholder="Briefly describe the reason for this appointment (e.g. follow-up, annual checkup, specific concern)."
            maxLength={MAX_REASON_LENGTH}
            className="min-h-24 resize-none"
            {...register("reason")}
          />
          <p className="text-xs text-muted-foreground">
            This helps the doctor prepare for your visit.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
              3
            </span>
            <Label htmlFor="attachment">
              Attach a document{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
          </div>
          <Input
            id="attachment"
            type="file"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
          />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {attachment
              ? attachment.name
              : "PDF, JPG, or PNG — e.g. a fitness/recovery certificate justifying this request."}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end border-t bg-muted/30 px-6 pt-4 pb-6">
        <Button
          type="button"
          onClick={handleSend}
          disabled={availabilities.length === 0 || isSending || isSubmitting}
          className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isSending || isSubmitting ? "Sending..." : submitLabel}
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
