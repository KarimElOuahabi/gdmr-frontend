import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import { DocumentManager } from "@/features/document/DocumentManager";
import { DOCTOR_UPLOADABLE_TYPES } from "@/features/document/documentMeta";
import { MedicalHistoryPanel } from "@/features/medical-history/MedicalHistoryPanel";
import type { VisitResponse } from "@/features/visit/visitApi";

type RecordTab = "documents" | "history";

interface PatientRecordDialogProps {
  visit: VisitResponse | null;
  onClose: () => void;
  documentDescription?: string;
}

export function PatientRecordDialog({
  visit,
  onClose,
  documentDescription = "Reports, certificates, and prescriptions for this employee.",
}: PatientRecordDialogProps) {
  const [tab, setTab] = useState<RecordTab>("documents");

  return (
    <Dialog
      open={!!visit}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTab("documents");
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Patient record</DialogTitle>
          <DialogDescription>
            Documents and medical history for this employee.
          </DialogDescription>
        </DialogHeader>
        {visit && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as RecordTab)}>
            <TabsList>
              <TabsTab value="documents">Documents</TabsTab>
              <TabsTab value="history">Medical History</TabsTab>
            </TabsList>
            <TabsPanel value="documents" className="pt-4">
              {tab === "documents" && (
                <>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {documentDescription}
                  </p>
                  <DocumentManager
                    mode="employee"
                    employeeId={visit.employeeId}
                    visitId={visit.id}
                    uploadableTypes={DOCTOR_UPLOADABLE_TYPES}
                    emptyLabel="No documents for this employee yet."
                  />
                </>
              )}
            </TabsPanel>
            <TabsPanel value="history" className="pt-4">
              {tab === "history" && (
                <MedicalHistoryPanel employeeId={visit.employeeId} visitId={visit.id} />
              )}
            </TabsPanel>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
