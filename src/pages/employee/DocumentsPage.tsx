import { DocumentManager } from "@/features/document/DocumentManager";
import { EMPLOYEE_UPLOADABLE_TYPES } from "@/features/document/documentMeta";

export function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Documents</h1>
        <p className="text-muted-foreground">
          Medical reports, certificates, and prescriptions on your file.
        </p>
      </div>

      <DocumentManager
        mode="self"
        uploadableTypes={EMPLOYEE_UPLOADABLE_TYPES}
        emptyLabel="No documents on file yet."
      />
    </div>
  );
}
