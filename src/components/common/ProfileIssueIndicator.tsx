import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useListProfileIssuesQuery,
  useResolveProfileIssueMutation,
} from "@/features/profile-issue/profileIssueApi";

interface ProfileIssueIndicatorProps {
  userId: number;
}

// Sits on the same line as the "Contact & employment details" card title —
// a muted/active toggle button surfacing any reclamation this user filed
// about their own profile, with a per-field switch to mark it resolved.
export function ProfileIssueIndicator({ userId }: ProfileIssueIndicatorProps) {
  const [open, setOpen] = useState(false);
  const { data: issues } = useListProfileIssuesQuery(userId);
  const [resolveIssue] = useResolveProfileIssueMutation();

  if (!issues || issues.length === 0) return null;

  const openCount = issues.filter((i) => !i.resolved).length;
  const active = openCount > 0;

  const handleToggle = async (issueId: number, resolved: boolean) => {
    try {
      await resolveIssue({ id: issueId, resolved, userId }).unwrap();
      toast.add({
        title: resolved ? "Correction marked resolved" : "Correction reopened",
      });
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to update the correction status.",
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`gap-1.5 ${
          active
            ? "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            : "text-muted-foreground"
        }`}
        onClick={() => setOpen(true)}
      >
        <Flag className="size-3.5" />
        {active
          ? `${openCount} correction${openCount > 1 ? "s" : ""} requested`
          : "Corrections resolved"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reported corrections</DialogTitle>
            <DialogDescription>
              Fields this person flagged as incorrect, with their suggested
              fix. Toggle a row once you've applied the correction above.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-lg border p-3 transition-opacity ${
                  issue.resolved ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{issue.fieldName}</p>
                    <p className="text-sm text-muted-foreground">
                      Suggested:{" "}
                      <span className="text-foreground">
                        {issue.suggestedCorrection}
                      </span>
                    </p>
                    {issue.note && (
                      <p className="text-xs text-muted-foreground">
                        Note: {issue.note}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={issue.resolved}
                    onCheckedChange={(resolved) =>
                      handleToggle(issue.id, resolved)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
