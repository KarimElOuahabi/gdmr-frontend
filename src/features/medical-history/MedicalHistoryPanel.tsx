import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { Plus, ClipboardList } from "lucide-react";
import {
  useListMedicalHistoryQuery,
  useAddMedicalHistoryEntryMutation,
} from "@/features/medical-history/medicalHistoryApi";
import type { MedicalHistoryCategory } from "@/features/medical-history/medicalHistoryApi";
import {
  MEDICAL_HISTORY_CATEGORY_META,
  ALL_MEDICAL_HISTORY_CATEGORIES,
} from "@/features/medical-history/medicalHistoryMeta";

interface MedicalHistoryPanelProps {
  employeeId: number;
  visitId?: number;
  emptyLabel?: string;
}

export function MedicalHistoryPanel({
  employeeId,
  visitId,
  emptyLabel = "No medical history recorded yet.",
}: MedicalHistoryPanelProps) {
  const { data, isLoading } = useListMedicalHistoryQuery({ employeeId });
  const [addEntry, { isLoading: isAdding }] = useAddMedicalHistoryEntryMutation();

  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState<MedicalHistoryCategory | "">("");
  const [description, setDescription] = useState("");

  const entries = data ?? [];

  const handleAdd = async () => {
    if (!category || !description.trim()) return;
    try {
      await addEntry({
        employeeId,
        visitId,
        category,
        description: description.trim(),
      }).unwrap();
      toast.add({ title: "Entry added to medical history" });
      setShowAdd(false);
      setCategory("");
      setDescription("");
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to add the entry.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="size-4" />
          Add entry
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : entries.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <ClipboardList className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">{emptyLabel}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const meta = MEDICAL_HISTORY_CATEGORY_META[entry.category];
            const Icon = meta.icon;
            return (
              <Card
                key={entry.id}
                className="flex-row items-start gap-3 p-4 transition-shadow hover:shadow-lg"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${meta.className}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {entry.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to medical history</DialogTitle>
            <DialogDescription>
              Record an allergy, condition, or other clinically relevant
              background for this employee.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category || undefined}
              onValueChange={(v) => setCategory(v as MedicalHistoryCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ALL_MEDICAL_HISTORY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {MEDICAL_HISTORY_CATEGORY_META[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="history-description">Description</Label>
            <Textarea
              id="history-description"
              placeholder="e.g. Penicillin allergy — hives on contact."
              className="min-h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleAdd}
              disabled={isAdding || !category || !description.trim()}
            >
              {isAdding ? "Saving..." : "Add entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
