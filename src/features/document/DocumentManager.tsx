import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { Upload, Download, FolderOpen, History, Trash2 } from "lucide-react";
import {
  useListMyDocumentsQuery,
  useListDocumentsByEmployeeIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useDownloadDocumentMutation,
} from "@/features/document/documentApi";
import type {
  DocumentType,
  MedicalDocumentResponse,
} from "@/features/document/documentApi";
import { DOCUMENT_META } from "@/features/document/documentMeta";

interface DocumentManagerProps {
  mode: "self" | "employee";
  employeeId?: number;
  visitId?: number;
  uploadableTypes: DocumentType[];
  emptyLabel?: string;
}

export function DocumentManager({
  mode,
  employeeId,
  visitId,
  uploadableTypes,
  emptyLabel = "No documents yet.",
}: DocumentManagerProps) {
  const selfQuery = useListMyDocumentsQuery(undefined, { skip: mode !== "self" });
  const employeeQuery = useListDocumentsByEmployeeIdQuery(
    { employeeId: employeeId ?? 0 },
    { skip: mode !== "employee" || !employeeId },
  );
  const { data, isLoading } = mode === "self" ? selfQuery : employeeQuery;

  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [downloadDocument] = useDownloadDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const [showUpload, setShowUpload] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [docToDelete, setDocToDelete] =
    useState<MedicalDocumentResponse | null>(null);

  // Doctors alone can delete/replace a wrongly-uploaded document — this manager
  // is only ever rendered with mode="employee" from doctor-facing pages.
  const canManage = mode === "employee";

  const documents = [...(data ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const handleUpload = async () => {
    if (!documentType || !file) return;
    try {
      await uploadDocument({
        documentType,
        file,
        employeeId: mode === "employee" ? employeeId : undefined,
        visitId,
      }).unwrap();
      toast.add({ title: "Document uploaded", description: file.name });
      setShowUpload(false);
      setDocumentType("");
      setFile(null);
    } catch {
      toast.add({ title: "Error", description: "Failed to upload the document." });
    }
  };

  const handleDownload = (doc: MedicalDocumentResponse) => {
    downloadDocument({ id: doc.id, filename: doc.originalFilename });
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument({ id: docToDelete.id }).unwrap();
      toast.add({
        title: "Document deleted",
        description: docToDelete.originalFilename,
      });
      setDocToDelete(null);
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to delete the document.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" className="gap-2" onClick={() => setShowUpload(true)}>
          <Upload className="size-4" />
          Upload document
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <FolderOpen className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">{emptyLabel}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc) => {
            const meta = DOCUMENT_META[doc.documentType];
            const Icon = meta.icon;
            return (
              <Card
                key={doc.id}
                className="flex-row items-start gap-3 p-4 transition-shadow hover:shadow-lg"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${meta.className}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">
                      {meta.label}
                    </p>
                    {doc.version > 1 && (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <History className="size-3" />v{doc.version}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {doc.originalFilename}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDownload(doc)}
                    aria-label="Download"
                  >
                    <Download className="size-4" />
                  </Button>
                  {canManage && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDocToDelete(doc)}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload a document</DialogTitle>
            <DialogDescription>
              {mode === "self"
                ? "Only fitness/recovery certificates can be uploaded here."
                : "Attach a report, certificate, or prescription for this patient."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Document type</Label>
            <Select
              value={documentType || undefined}
              onValueChange={(v) => setDocumentType(v as DocumentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {uploadableTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {DOCUMENT_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {documentType && (
              <p className="text-xs text-muted-foreground">
                {DOCUMENT_META[documentType].description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-file">File</Label>
            <Input
              id="doc-file"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">PDF, JPG, or PNG only.</p>
          </div>

          <DialogFooter>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !documentType || !file}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!docToDelete}
        onOpenChange={(open) => !open && setDocToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              {docToDelete?.originalFilename} will be permanently deleted. If
              it was the wrong file, upload the correct one afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
