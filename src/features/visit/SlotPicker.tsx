import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { CalendarClock, Plus, MessageSquare } from "lucide-react";
import {
  useListTimeSlotsQuery,
  useCreateTimeSlotMutation,
} from "@/features/timeslot/timeSlotApi";
import type { NegotiationEntryResponse } from "@/features/visit/visitApi";
import { ALL_VISIT_TYPES, type VisitType } from "@/types/visit";

const newSlotFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  visitType: z.enum(ALL_VISIT_TYPES),
});
type NewSlotFormValues = z.infer<typeof newSlotFormSchema>;

function formatSlot(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

interface SlotPickerProps {
  doctorId: number;
  /** Default (and, if locked, the only) type for slots in this picker. */
  defaultVisitType?: VisitType;
  /** When true, the visit type can't be changed — the list is filtered to it and the create-new form hides the type picker. Use when assigning to an existing visit whose type is already fixed. */
  lockVisitType?: boolean;
  /** Non-binding hint shown above the picker, e.g. an employee's suggested slots. */
  suggestedSlots?: string[];
  /** Full back-and-forth log of rejections + alternative times either side has proposed. */
  negotiationHistory?: NegotiationEntryResponse[];
  /** Called once a slot (existing or newly created) is ready to be used. */
  onSlotReady: (timeSlotId: number) => void | Promise<void>;
  /** Disables actions while the parent's own mutation (assign/create visit) is in flight. */
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function SlotPicker({
  doctorId,
  defaultVisitType = "SPONTANEOUS",
  lockVisitType = false,
  suggestedSlots = [],
  negotiationHistory = [],
  onSlotReady,
  isSubmitting = false,
  submitLabel = "Use this slot",
}: SlotPickerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const { data: slotsData, isLoading: isLoadingSlots } = useListTimeSlotsQuery(
    {
      doctorId,
      availableOnly: true,
      visitType: lockVisitType ? defaultVisitType : undefined,
      page: 0,
      size: 50,
    },
  );

  const [createTimeSlot, { isLoading: isCreating }] =
    useCreateTimeSlotMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewSlotFormValues>({
    resolver: zodResolver(newSlotFormSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      visitType: defaultVisitType,
    },
  });
  const visitType = watch("visitType");

  const onCreateAndUse = async (data: NewSlotFormValues) => {
    try {
      const created = await createTimeSlot({
        doctorId,
        startTime: `${data.date}T${data.startTime}:00`,
        endTime: `${data.date}T${data.endTime}:00`,
        visitType: data.visitType,
      }).unwrap();
      await onSlotReady(created.id);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: { message?: string } }).data?.message ===
          "string" &&
        (err as { data: { message: string } }).data.message.includes(
          "not available",
        )
          ? "This doctor is not available during the selected time."
          : "Failed to create the time slot.";
      toast.add({ title: "Error", description: message });
    }
  };

  const useSuggestion = async (entry: NegotiationEntryResponse) => {
    try {
      const start = new Date(entry.suggestedDateTime);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const created = await createTimeSlot({
        doctorId,
        startTime: entry.suggestedDateTime,
        endTime: end.toISOString().slice(0, 19),
        visitType: defaultVisitType,
      }).unwrap();
      await onSlotReady(created.id);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: { message?: string } }).data?.message ===
          "string" &&
        (err as { data: { message: string } }).data.message.includes(
          "not available",
        )
          ? "This doctor is not available during that time."
          : "Failed to use this suggestion.";
      toast.add({ title: "Error", description: message });
    }
  };

  const busy = isSubmitting || isCreating;

  return (
    <div className="space-y-4">
      {suggestedSlots.length > 0 && (
        <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Employee&apos;s suggested slots
          </p>
          <ul className="text-sm">
            {suggestedSlots.map((slot) => (
              <li key={slot}>{new Date(slot).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}

      {negotiationHistory.length > 0 && (
        <div className="space-y-2 rounded-lg border p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MessageSquare className="size-3.5" />
            Negotiation history
          </p>
          <ul className="flex flex-col gap-2">
            {negotiationHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1.5 rounded-md bg-muted/20 p-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium">
                    {entry.actor === "DOCTOR" ? "Doctor" : "Employee"} rejected:
                  </span>{" "}
                  <span className="text-muted-foreground">{entry.reason}</span>
                  <div className="text-xs text-muted-foreground">
                    Suggested: {new Date(entry.suggestedDateTime).toLocaleString()}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => useSuggestion(entry)}
                >
                  Use this suggestion
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!showCreateForm && (
        <div className="space-y-2">
          {isLoadingSlots ? (
            <p className="text-sm text-muted-foreground">
              Loading available slots...
            </p>
          ) : slotsData && slotsData.content.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {slotsData.content.map((slot) => (
                <li key={slot.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/40 ${
                      selectedSlotId === slot.id
                        ? "border-primary bg-primary/5"
                        : "bg-muted/10"
                    }`}
                  >
                    <CalendarClock className="size-4 text-muted-foreground" />
                    <span>{formatSlot(slot.startTime, slot.endTime)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {slot.visitType}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No available slots for this doctor yet.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="size-4" />
            Create a new slot instead
          </Button>

          <Button
            className="w-full"
            disabled={!selectedSlotId || busy}
            onClick={() => selectedSlotId && onSlotReady(selectedSlotId)}
          >
            {busy ? "Please wait..." : submitLabel}
          </Button>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleSubmit(onCreateAndUse)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <FieldError>{errors.date.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                <Input id="startTime" type="time" {...register("startTime")} />
                {errors.startTime && (
                  <FieldError>{errors.startTime.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="endTime">End time</FieldLabel>
                <Input id="endTime" type="time" {...register("endTime")} />
                {errors.endTime && (
                  <FieldError>{errors.endTime.message}</FieldError>
                )}
              </Field>
            </div>

            {!lockVisitType && (
              <Field>
                <FieldLabel>Visit type</FieldLabel>
                <Select
                  value={visitType}
                  onValueChange={(v) => setValue("visitType", v as VisitType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_VISIT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Back to slot list
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait..." : `Create & ${submitLabel.toLowerCase()}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
