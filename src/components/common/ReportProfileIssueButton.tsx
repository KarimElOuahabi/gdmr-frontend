import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useReportProfileIssueMutation } from "@/features/profile-issue/profileIssueApi";

interface FieldOption {
  value: string;
  label: string;
}

interface ReportProfileIssueButtonProps {
  fieldOptions: FieldOption[];
}

export function ReportProfileIssueButton({
  fieldOptions,
}: ReportProfileIssueButtonProps) {
  const [open, setOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [suggestedCorrection, setSuggestedCorrection] = useState("");
  const [note, setNote] = useState("");
  const [reportIssue, { isLoading }] = useReportProfileIssueMutation();

  const reset = () => {
    setFieldName("");
    setSuggestedCorrection("");
    setNote("");
  };

  const handleSubmit = async () => {
    if (!fieldName || !suggestedCorrection.trim()) return;
    try {
      await reportIssue({
        fieldName:
          fieldOptions.find((f) => f.value === fieldName)?.label ?? fieldName,
        suggestedCorrection: suggestedCorrection.trim(),
        note: note.trim() || undefined,
      }).unwrap();
      toast.add({
        title: "Reported",
        description: "HR/Admin have been notified of the correction.",
      });
      reset();
      setOpen(false);
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to report the issue. Please try again.",
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Flag className="h-3.5 w-3.5" />
        Report incorrect info
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report incorrect information</DialogTitle>
            <DialogDescription>
              Let HR/Admin know which field is wrong and what it should say
              instead. They&apos;ll review and update your profile.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>Which field is wrong?</FieldLabel>
              <Select
                value={fieldName}
                onValueChange={(v) => setFieldName(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="suggestedCorrection">
                What should it be?
              </FieldLabel>
              <Input
                id="suggestedCorrection"
                placeholder="Correct value"
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="note">
                Note{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="note"
                placeholder="Anything else to add"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!fieldName || !suggestedCorrection.trim() || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Sending..." : "Send report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
